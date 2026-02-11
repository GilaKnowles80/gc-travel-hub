import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SeatMap = ({ cabinClass, numberOfPassengers, onSeatsSelected }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Generate seat layout based on cabin class
  const getSeatLayout = () => {
    switch (cabinClass) {
      case "first_class":
        return { rows: 8, columns: ["A", "C", "D", "F"], seatsPerRow: 4 };
      case "business":
        return { rows: 12, columns: ["A", "C", "D", "F"], seatsPerRow: 4 };
      case "premium_economy":
        return { rows: 15, columns: ["A", "B", "C", "D", "E", "F"], seatsPerRow: 6 };
      case "economy":
      default:
        return { rows: 30, columns: ["A", "B", "C", "D", "E", "F"], seatsPerRow: 6 };
    }
  };

  const layout = getSeatLayout();
  
  // Simulate some occupied seats (in a real app, this would come from the backend)
  const occupiedSeats = React.useMemo(() => {
    const seats = new Set();
    const occupiedCount = Math.floor(layout.rows * layout.seatsPerRow * 0.3);
    for (let i = 0; i < occupiedCount; i++) {
      const row = Math.floor(Math.random() * layout.rows) + 1;
      const col = layout.columns[Math.floor(Math.random() * layout.columns.length)];
      seats.add(`${row}${col}`);
    }
    return seats;
  }, [cabinClass]);

  const toggleSeat = (seatId) => {
    if (occupiedSeats.has(seatId)) return;

    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seatId);
      if (isSelected) {
        return prev.filter((s) => s !== seatId);
      } else {
        if (prev.length >= numberOfPassengers) {
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  React.useEffect(() => {
    onSeatsSelected(selectedSeats);
  }, [selectedSeats, onSeatsSelected]);

  const getSeatColor = (seatId) => {
    if (occupiedSeats.has(seatId)) {
      return "bg-slate-300 cursor-not-allowed";
    }
    if (selectedSeats.includes(seatId)) {
      return "bg-amber-500 hover:bg-amber-600 text-white";
    }
    return "bg-white border-2 border-slate-300 hover:border-amber-400 hover:bg-amber-50";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 border-slate-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-300 rounded"></div>
            <span>Occupied</span>
          </div>
        </div>
        <div className="text-sm font-medium">
          {selectedSeats.length} / {numberOfPassengers} seats selected
        </div>
      </div>

      <div className="bg-slate-100 rounded-xl p-6 max-h-[400px] overflow-y-auto">
        {/* Cockpit indicator */}
        <div className="text-center mb-6">
          <div className="inline-block bg-slate-800 text-white px-6 py-2 rounded-t-full text-xs font-medium">
            COCKPIT
          </div>
        </div>

        {/* Seat grid */}
        <div className="space-y-2">
          {Array.from({ length: layout.rows }, (_, rowIndex) => {
            const rowNumber = rowIndex + 1;
            return (
              <div key={rowNumber} className="flex items-center justify-center gap-2">
                <span className="w-8 text-center text-xs font-medium text-slate-600">
                  {rowNumber}
                </span>
                
                <div className="flex gap-2">
                  {layout.columns.map((col, colIndex) => {
                    const seatId = `${rowNumber}${col}`;
                    const isAisle = colIndex === Math.floor(layout.columns.length / 2);
                    
                    return (
                      <React.Fragment key={col}>
                        {isAisle && <div className="w-4" />}
                        <button
                          type="button"
                          onClick={() => toggleSeat(seatId)}
                          disabled={occupiedSeats.has(seatId)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                            getSeatColor(seatId)
                          )}
                        >
                          {col}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                <span className="w-8 text-center text-xs font-medium text-slate-600">
                  {rowNumber}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-slate-900 mb-2">Selected Seats:</p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <span key={seat} className="bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                {seat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMap;