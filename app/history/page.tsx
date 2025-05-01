"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ChevronLeft, ChevronRight, Calendar, CheckCircle2, Circle } from "lucide-react"
import { toast } from "sonner"

type Option = {
  id: number
  name: string
  is_completed: boolean
}

type Location = {
  id: number
  location_id: string
  name: string
  notes: string
  options: Option[]
}

type Round = {
  id: number
  date: string
  created_at: string
  locations: Location[]
}

export default function HistoryPage() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(0)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    fetchRounds()
  }, [])

  const fetchRounds = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rounds?limit=30`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch rounds history')
      }
      
      const data = await response.json()
      
      if (data.rounds && data.rounds.length > 0) {
        setRounds(data.rounds)
      } else {
        setRounds([])
      }
    } catch (error) {
      console.error('Error fetching rounds history:', error)
      toast.error('Failed to load rounds history')
    } finally {
      setLoading(false)
    }
  }

  const toggleOptionCompletion = async (optionId: number, isCurrentlyCompleted: boolean) => {
    try {
      setUpdating(optionId)
      
      const response = await fetch('/api/rounds/option', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          optionId,
          isCompleted: !isCurrentlyCompleted
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update option')
      }
      
      // Update the local state
      setRounds(prevRounds => {
        return prevRounds.map((round, index) => {
          if (index === selectedRoundIndex) {
            return {
              ...round,
              locations: round.locations.map(location => {
                return {
                  ...location,
                  options: location.options.map(option => {
                    if (option.id === optionId) {
                      return {
                        ...option,
                        is_completed: !isCurrentlyCompleted
                      }
                    }
                    return option
                  })
                }
              })
            }
          }
          return round
        })
      })
      
      toast.success('Updated option status')
    } catch (error) {
      console.error('Error updating option:', error)
      toast.error('Failed to update option')
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const handlePrevious = () => {
    if (selectedRoundIndex < rounds.length - 1) {
      setSelectedRoundIndex(selectedRoundIndex + 1)
    }
  }

  const handleNext = () => {
    if (selectedRoundIndex > 0) {
      setSelectedRoundIndex(selectedRoundIndex - 1)
    }
  }

  const selectedRound = rounds[selectedRoundIndex]

  return (
    <div className="flex min-h-screen flex-col items-center p-4 bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-400 hover:bg-amber-950/30">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-amber-500">Round History</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        {loading ? (
          <Card className="w-full border-amber-800/50 bg-card">
            <CardContent className="pt-6 flex justify-center items-center h-48">
              <p className="text-amber-400">Loading history...</p>
            </CardContent>
          </Card>
        ) : rounds.length === 0 ? (
          <Card className="w-full border-amber-800/50 bg-card">
            <CardContent className="pt-6 flex flex-col justify-center items-center h-48">
              <p className="text-amber-400">No round history available</p>
              <Link href="/round" className="mt-4">
                <Button variant="outline" className="border-amber-600 text-amber-400 hover:bg-amber-950/30">
                  Start Today's Round
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={selectedRoundIndex >= rounds.length - 1}
                className="border-amber-600 text-amber-400 hover:bg-amber-950/30"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Older
              </Button>
              
              <div className="flex items-center space-x-1 text-amber-400">
                <Calendar className="h-4 w-4" />
                <span>{selectedRound ? formatDate(selectedRound.date) : 'No data'}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={selectedRoundIndex <= 0}
                className="border-amber-600 text-amber-400 hover:bg-amber-950/30"
              >
                Newer <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {selectedRound && (
              <Card className="w-full border-amber-800/50 bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-400 text-lg">
                    Round for {formatDate(selectedRound.date)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedRound.locations.map(location => (
                      <div key={location.id} className="border border-amber-800/30 rounded-md p-3">
                        <h3 className="text-amber-400 font-medium mb-2">{location.name}</h3>
                        
                        {location.options.length > 0 && (
                          <ul className="space-y-2 mb-2">
                            {location.options.map(option => (
                              <li 
                                key={option.id} 
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => toggleOptionCompletion(option.id, option.is_completed)}
                              >
                                {updating === option.id ? (
                                  <div className="h-5 w-5 animate-pulse bg-amber-800/30 rounded-full" />
                                ) : option.is_completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-amber-600" />
                                )}
                                
                                <span className={option.is_completed ? "line-through text-green-500/70" : "text-secondary"}>
                                  {option.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {location.notes && (
                          <div className="text-sm text-secondary bg-amber-950/20 p-2 rounded">
                            {location.notes}
                          </div>
                        )}
                      </div>
                    ))}

                    {selectedRound.locations.length === 0 && (
                      <div className="py-4 text-amber-400/70 text-center">
                        <p>No locations recorded for this day.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}