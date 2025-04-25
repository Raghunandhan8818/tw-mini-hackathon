import React from 'react';

function SchedulePicker({ selectedDays, onChange }) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            onChange(selectedDays.filter(d => d !== day));
        } else {
            onChange([...selectedDays, day]);
        }
    };

    return (
        <div className="schedule-picker">
            <h3>Office Days</h3>
            <div className="days-container">
                {days.map(day => (
                    <div
                        key={day}
                        className={`day-item ${selectedDays.includes(day) ? 'selected' : ''}`}
                        onClick={() => toggleDay(day)}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SchedulePicker;