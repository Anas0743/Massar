import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "./ui/Button"

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unexpected UI error", error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
        <div className="max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-float">
          <p className="text-sm font-black text-primary-700">حدث خطأ غير متوقع</p>
          <h1 className="mt-3 text-3xl font-black">لم نستطع عرض هذه الصفحة الآن</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            تم إيقاف الجزء المتأثر بدل ترك الصفحة فارغة. أعد تحميل الصفحة أو ارجع لاحقًا.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            إعادة تحميل الصفحة
          </Button>
        </div>
      </main>
    )
  }
}
