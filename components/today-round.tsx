"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle } from "lucide-react"
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

export default function TodayRound() {
  const [round, setRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    fetchTodayRound()
  }, [])

  const fetchTodayRound = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/rounds?date=${today}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch round data')
      }
      
      const data = await response.json()
      
      if (data.rounds && data.rounds.length > 0) {
        setRound(data.rounds[0])
      } else {
        setRound(null)
      }
    } catch (error) {
      console.error('Error fetching today\'s round:', error)
      toast.error('Failed to load today\'s round')
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
      setRound(prev => {
        if (!prev) return prev
        
        return {
          ...prev,
          locations: prev.locations.map(location => {
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
      })
      
    } catch (error) {
      console.error('Error updating option:', error)
      toast.error('Failed to update option')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return <div className="py-4 text-amber-400/70 text-center">Loading today's round...</div>
  }

  if (!round) {
    return (
      <div className="py-4 text-amber-400/70 text-center">
        <p>No round data for today.</p>
        <p className="text-sm mt-2">Complete your daily round to see it here.</p>
      </div>
    )
  }

  // Filter locations to only include those with options
  const locationsWithOptions = round.locations.filter(
    loc => loc.options.length > 0 || loc.notes
  )

  if (locationsWithOptions.length === 0) {
    return (
      <div className="py-4 text-amber-400/70 text-center">
        <p>Nothing to do for today.</p>
        <p className="text-sm mt-2">All done!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {locationsWithOptions.map(location => (
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
    </div>
  )
}