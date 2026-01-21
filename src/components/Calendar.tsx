import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarTask {
  id: string;
  title: string;
  due_date: string;
  status: string;
}

interface CalendarProps {
  tasks: CalendarTask[];
  onTaskClick: (task: CalendarTask) => void;
  onDateClick: (date: Date) => void;
}

export function Calendar({ tasks, onTaskClick, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getTasksForDate = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];

    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const renderDays = () => {
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-24 bg-gray-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayTasks = getTasksForDate(day);
      const today = isToday(day);

      days.push(
        <div
          key={day}
          onClick={() => onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
          className={`min-h-24 p-2 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
            today ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${today ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayTasks.map(task => (
              <div
                key={task.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskClick(task);
                }}
                className={`text-xs p-1.5 rounded truncate ${
                  task.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : task.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-px mb-px">
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {renderDays()}
        </div>
      </div>
    </div>
  );
}
