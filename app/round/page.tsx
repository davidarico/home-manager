"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Home, Save } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

// Change the locations array to have consistent options for most locations
const locations = [
  { id: "bedroom", name: "Bedroom", options: ["Needs Cleaning", "Organize"] },
  { id: "laundry", name: "Laundry", options: ["Start Load", "Move to Dryer", "Fold Clothes"] },
  { id: "loftSpace", name: "Loft Space", options: ["Needs Cleaning", "Organize"] },
  { id: "desk", name: "Desk", options: ["Needs Cleaning", "Organize"] },
  { id: "bathroom", name: "Bathroom", options: ["Needs Cleaning", "Organize"] },
  { id: "toilet", name: "Toilet", options: ["Needs Cleaning"] },
  { id: "roofStairs", name: "Roof Stairs", options: ["Needs Cleaning"] },
  { id: "loftStairs", name: "Loft Stairs", options: ["Needs Cleaning"] },
  { id: "diningRoom", name: "Dining Room", options: ["Needs Cleaning", "Organize"] },
  { id: "kitchen", name: "Kitchen", options: ["Needs Cleaning", "Organize"] },
  { id: "pantry", name: "Pantry", options: ["Needs Cleaning", "Organize"] },
  { id: "trash", name: "Trash", options: ["Take Out"] },
  { id: "recycle", name: "Recycle", options: ["Take Out"] },
  { id: "livingRoom", name: "Living Room", options: ["Needs Cleaning", "Organize"] },
  { id: "guestBathroom", name: "Guest Bathroom", options: ["Needs Cleaning", "Organize"] },
  { id: "mainStairs", name: "Main Stairs", options: ["Needs Cleaning"] },
  { id: "entryway", name: "Entryway", options: ["Needs Cleaning", "Organize"] },
]

type RoundData = Record<string, { options: string[]; notes: string }>;

export default function Round() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [roundData, setRoundData] = useState<RoundData>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const isMobile = useIsMobile()
  
  // Load today's round data on initial load
  useEffect(() => {
    const fetchTodayRound = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const response = await fetch(`/api/rounds?date=${today}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch round data');
        }
        
        const data = await response.json();
        
        // If we have today's round data
        if (data.rounds && data.rounds.length > 0) {
          const round = data.rounds[0];
          
          // Convert the API response format to our local state format
          const formattedData: RoundData = {};
          
          round.locations.forEach((location: any) => {
            formattedData[location.location_id] = {
              notes: location.notes || '',
              options: location.options.map((opt: any) => opt.name)
            };
          });
          
          setRoundData(formattedData);
        } else {
          // Initialize with empty data if no round exists yet
          initializeEmptyData();
        }
      } catch (error) {
        console.error('Error loading round data:', error);
        toast.error('Failed to load round data');
        initializeEmptyData();
      } finally {
        setLoading(false);
      }
    };
    
    // Initialize with empty data
    const initializeEmptyData = () => {
      const emptyData = locations.reduce(
        (acc, location) => {
          acc[location.id] = { options: [], notes: "" }
          return acc
        },
        {} as RoundData
      );
      
      setRoundData(emptyData);
    };
    
    fetchTodayRound();
  }, []);

  const currentLocation = locations[currentIndex];

  // Replace the handleOptionChange function with a toggle function for checkboxes
  const handleOptionToggle = (option: string) => {
    setRoundData((prev) => {
      const currentOptions = prev[currentLocation.id]?.options || []
      let newOptions: string[]

      if (currentOptions.includes(option)) {
        // Remove the option if it's already selected
        newOptions = currentOptions.filter((item) => item !== option)
      } else {
        // Add the option if it's not already selected
        newOptions = [...currentOptions, option]
      }

      return {
        ...prev,
        [currentLocation.id]: {
          ...prev[currentLocation.id],
          options: newOptions,
        },
      }
    })
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRoundData((prev) => ({
      ...prev,
      [currentLocation.id]: {
        ...prev[currentLocation.id],
        notes: e.target.value,
      },
    }))
  }

  const handleNext = () => {
    if (currentIndex < locations.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Format the data for the API
      const formattedData = {
        locations: Object.keys(roundData).reduce((acc: any, locationId) => {
          const locationInfo = locations.find(loc => loc.id === locationId);
          if (locationInfo) {
            acc[locationId] = {
              name: locationInfo.name,
              notes: roundData[locationId].notes,
              options: roundData[locationId].options
            };
          }
          return acc;
        }, {})
      };
      
      // Send data to the API
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save round data');
      }
      
      // Show success message
      toast.success('Round data saved successfully!');
      
      // If we're on the last location, redirect to home page
      if (currentIndex === locations.length - 1) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error saving round data:', error);
      toast.error('Failed to save round data');
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-xl font-bold text-amber-500">Daily Round</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-amber-500 hover:text-amber-400 hover:bg-amber-950/30"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-sm text-amber-400 text-center mb-4">
          {currentIndex + 1} of {locations.length}
        </div>

        {loading ? (
          <Card className="w-full border-amber-800/50 bg-card">
            <CardContent className="pt-6 flex justify-center items-center h-48">
              <p className="text-amber-400">Loading...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full border-amber-800/50 bg-card">
            <CardHeader>
              <CardTitle className="text-amber-400">{currentLocation.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentLocation.options.length > 0 && (
                <div className="space-y-3">
                  {currentLocation.options.map((option) => (
                    <div 
                      key={option} 
                      className="flex items-center space-x-3 p-2 rounded hover:bg-amber-950/20"
                      onClick={() => handleOptionToggle(option)}
                    >
                      <div className={`flex items-center justify-center ${isMobile ? 'h-6 w-6' : 'h-4 w-4'} border rounded-sm border-amber-600 ${
                        roundData[currentLocation.id]?.options?.includes(option)
                        ? 'bg-amber-600'
                        : 'bg-amber-950/30'
                      }`}>
                        {roundData[currentLocation.id]?.options?.includes(option) && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`${isMobile ? 'h-5 w-5' : 'h-3 w-3'} text-amber-950`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <Label 
                        htmlFor={`${currentLocation.id}-${option}`} 
                        className="text-secondary flex-grow cursor-pointer"
                      >
                        {option}
                      </Label>
                      <input
                        type="checkbox"
                        id={`${currentLocation.id}-${option}`}
                        checked={roundData[currentLocation.id]?.options?.includes(option) || false}
                        onChange={() => handleOptionToggle(option)}
                        className="sr-only" // Hidden but accessible
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="notes" className="text-secondary">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes here..."
                  value={roundData[currentLocation.id]?.notes || ""}
                  onChange={handleNotesChange}
                  className="mt-1 bg-amber-950/20 border-amber-800/50 focus:border-amber-600 placeholder:text-amber-800/50"
                  rows={isMobile ? 4 : 3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="border-amber-600 text-amber-400 hover:bg-amber-950/30 hover:text-amber-300"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              {currentIndex === locations.length - 1 ? (
                <Button
                  onClick={handleSave}
                  className="bg-amber-600 text-amber-950 hover:bg-amber-500"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Finish'} 
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-amber-600 text-amber-950 hover:bg-amber-500"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
