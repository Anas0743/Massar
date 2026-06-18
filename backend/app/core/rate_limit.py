from collections import defaultdict, deque
from collections.abc import Callable
from time import monotonic

from fastapi import HTTPException, Request, status

from app.core.config import settings

WINDOW_SECONDS = {
    "second": 1,
    "minute": 60,
    "hour": 60 * 60,
}

RequestLog = dict[str, deque[float]]
request_log: RequestLog = defaultdict(deque)
last_cleanup_at = 0.0


def parse_limit(limit: str) -> tuple[int, int]:
    try:
        count_text, window_text = limit.split("/", 1)
        count = int(count_text)
        window = WINDOW_SECONDS[window_text.strip().lower()]
    except (KeyError, TypeError, ValueError) as exc:
        raise ValueError(f"Invalid rate limit format: {limit}") from exc
    if count <= 0:
        raise ValueError("Rate limit count must be positive.")
    return count, window


def client_identifier(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def cleanup_request_log(now: float) -> None:
    global last_cleanup_at
    if now - last_cleanup_at < settings.RATE_LIMIT_CLEANUP_INTERVAL_SECONDS:
        return

    cutoff = now - max(WINDOW_SECONDS.values())
    for key, bucket in list(request_log.items()):
        while bucket and bucket[0] < cutoff:
            bucket.popleft()
        if not bucket:
            del request_log[key]

    if len(request_log) > settings.RATE_LIMIT_MAX_KEYS:
        oldest_keys = sorted(
            request_log,
            key=lambda item: request_log[item][0] if request_log[item] else now,
        )
        overflow = len(request_log) - settings.RATE_LIMIT_MAX_KEYS
        for key in oldest_keys[:overflow]:
            request_log.pop(key, None)

    last_cleanup_at = now


def rate_limit(limit: str, scope: str) -> Callable[[Request], None]:
    count, window_seconds = parse_limit(limit)

    def dependency(request: Request) -> None:
        if not settings.RATE_LIMIT_ENABLED:
            return

        now = monotonic()
        cleanup_request_log(now)
        key = f"{scope}:{client_identifier(request)}"
        bucket = request_log[key]

        while bucket and now - bucket[0] >= window_seconds:
            bucket.popleft()

        if len(bucket) >= count:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": str(window_seconds)},
            )

        bucket.append(now)

    return dependency
