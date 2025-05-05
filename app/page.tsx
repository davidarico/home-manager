import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Repeat, Dumbbell, Clock, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TodayRound from "@/components/today-round"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Home() {
  // Format today's date
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date())

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-background">
      <div className="w-full max-w-md mx-auto space-y-6 mt-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-amber-500">Home Manager</h1>
          <p className="text-secondary mt-2">Manage your household tasks and routines</p>
        </div>

        {/* Today's Round Card */}
        <Card className="border-amber-800/50 bg-card">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-amber-400">Today's Round</CardTitle>
                <p className="text-sm text-amber-400/70 mt-1">{today}</p>
              </div>
              <Link href="/round">
                <Button variant="outline" size="sm" className="border-amber-600 text-amber-400 hover:bg-amber-950/30">
                  Edit Round
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <TodayRound />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Link href="/round" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-auto min-h-[5rem] py-3 text-lg justify-start gap-3 border-amber-600 hover:bg-amber-950/30"
            >
              <Repeat className="h-6 w-6 flex-shrink-0 text-amber-500" />
              <div className="text-left overflow-hidden">
                <div className="font-medium text-amber-400 truncate">Daily Round</div>
                <div className="text-sm text-secondary line-clamp-2">Check tasks around the house</div>
              </div>
            </Button>
          </Link>

          <Link href="/history" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-auto min-h-[5rem] py-3 text-lg justify-start gap-3 border-amber-600 hover:bg-amber-950/30"
            >
              <Clock className="h-6 w-6 flex-shrink-0 text-amber-500" />
              <div className="text-left overflow-hidden">
                <div className="font-medium text-amber-400 truncate">Round History</div>
                <div className="text-sm text-secondary line-clamp-2">View previous days' rounds</div>
              </div>
            </Button>
          </Link>

          <Link href="/stretch" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-auto min-h-[5rem] py-3 text-lg justify-start gap-3 border-amber-600 hover:bg-amber-950/30"
            >
              <Dumbbell className="h-6 w-6 flex-shrink-0 text-amber-500" />
              <div className="text-left overflow-hidden">
                <div className="font-medium text-amber-400 truncate">Stretch Routine</div>
                <div className="text-sm text-secondary line-clamp-2">Neck and shoulder stretch routine</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
