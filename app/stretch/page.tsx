"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, SkipForward, Home } from "lucide-react"
import Link from "next/link"

// Define the stretches
const stretches = [
  { name: "Neck Rolls", duration: 30, description: "Slowly roll your neck in a circular motion" },
  { name: "Neck Side Stretch (Left)", duration: 30, description: "Tilt your head to the left side" },
  { name: "Neck Side Stretch (Right)", duration: 30, description: "Tilt your head to the right side" },
  { name: "Forward Neck Stretch", duration: 30, description: "Gently lower your chin toward your chest" },
  { name: "Chin Tucks (1/5)", duration: 10, description: "Pull your chin back, creating a 'double chin'" },
  { name: "Rest", duration: 5, description: "Rest before next rep" },
  { name: "Chin Tucks (2/5)", duration: 10, description: "Pull your chin back, creating a 'double chin'" },
  { name: "Rest", duration: 5, description: "Rest before next rep" },
  { name: "Chin Tucks (3/5)", duration: 10, description: "Pull your chin back, creating a 'double chin'" },
  { name: "Rest", duration: 5, description: "Rest before next rep" },
  { name: "Chin Tucks (4/5)", duration: 10, description: "Pull your chin back, creating a 'double chin'" },
  { name: "Rest", duration: 5, description: "Rest before next rep" },
  { name: "Chin Tucks (5/5)", duration: 10, description: "Pull your chin back, creating a 'double chin'" },
  { name: "Shoulder Blade Squeeze (1/10)", duration: 10, description: "Squeeze your shoulder blades together" },
  { name: "Shoulder Blade Squeeze (2/10)", duration: 10, description: "Squeeze your shoulder blades together" },
  { name: "Shoulder Blade Squeeze (3/10)", duration: 10, description: "Squeeze your shoulder blades together" },
  { name: "Shoulder Blade Squeeze (4/10)", duration: 10, description: "Squeeze your shoulder blades together" },
  { name: "Shoulder Blade Squeeze (5/10)", duration: 10, description: "Squeeze your shoulder blades together" },
  { name: "Shoulder Blade Squeeze (6/10)", duration: 10, description: "Squeeze your shoulder blades together" },
  { name: "Shoulder Blade Squeeze (7/10)", duration: 10, description: "Squeeze your shoulder blades together" },
  { name: "Shoulder Blade Squeeze (8/10)", duration: 10, description: "Squeeze your shoulder blades together" },
  { name: "Shoulder Blade Squeeze (9/10)", duration: 10, description: "Squeeze your shoulder blades together" },
  { name: "Shoulder Blade Squeeze (10/10)", duration: 10, description: "Squeeze your shoulder blades together" },
  { name: "Cross Body Shoulder Stretch (Left)", duration: 30, description: "Bring your left arm across your body" },
  { name: "Cross Body Shoulder Stretch (Right)", duration: 30, description: "Bring your right arm across your body" },
]

// Calculate the total duration of the stretches
const calculateTotalDuration = () => {
  return stretches.reduce((total, stretch) => total + stretch.duration, 0)
}

// Format the total stretch duration
const formatTotalDuration = () => {
  const totalSeconds = calculateTotalDuration()
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
}

export default function Stretch() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(stretches[0].duration)
  const [isActive, setIsActive] = useState(false)
  const [progress, setProgress] = useState(100)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Create audio element
  useEffect(() => {
    audioRef.current = new Audio("/beep.mp3")
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
        setProgress((prev) => ((timeLeft - 1) / stretches[currentIndex].duration) * 100)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // Play sound when timer ends
      if (audioRef.current) {
        audioRef.current.play()
      }

      // Move to next stretch
      if (currentIndex < stretches.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setTimeLeft(stretches[currentIndex + 1].duration)
        setProgress(100)
      } else {
        // End of routine
        setIsActive(false)
      }
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, currentIndex])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const skipStretch = () => {
    if (currentIndex < stretches.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setTimeLeft(stretches[currentIndex + 1].duration)
      setProgress(100)
    }
  }

  const resetRoutine = () => {
    setCurrentIndex(0)
    setTimeLeft(stretches[0].duration)
    setProgress(100)
    setIsActive(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Update the component styling to match the dark sunrise theme
  return (
    <div className="flex min-h-screen flex-col items-center p-4 bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-400 hover:bg-amber-950/30">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-amber-500">Stretch Routine</h1>
            <p className="text-sm text-amber-400">Total Duration: {formatTotalDuration()}</p>
          </div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <div className="text-sm text-amber-400 text-center mb-4">
          {currentIndex + 1} of {stretches.length}
        </div>

        <Card className="w-full border-amber-800/50 bg-card">
          <CardHeader>
            <CardTitle className="text-amber-400">{stretches[currentIndex].name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-4xl font-bold text-amber-500">{formatTime(timeLeft)}</div>

            <Progress value={progress} className="h-2 bg-amber-950/30" />

            <div className="text-center text-secondary">{stretches[currentIndex].description}</div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant={isActive ? "outline" : "default"}
              onClick={toggleTimer}
              className={
                isActive
                  ? "border-amber-600 text-amber-400 hover:bg-amber-950/30 hover:text-amber-300"
                  : "bg-amber-600 text-amber-950 hover:bg-amber-500"
              }
            >
              {isActive ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={skipStretch}
              disabled={currentIndex === stretches.length - 1}
              className="border-amber-600 text-amber-400 hover:bg-amber-950/30 hover:text-amber-300"
            >
              <SkipForward className="mr-2 h-4 w-4" /> Skip
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={resetRoutine}
            className="text-amber-500 hover:text-amber-400 hover:bg-amber-950/30"
          >
            Reset Routine
          </Button>
        </div>
      </div>
    </div>
  )
}
