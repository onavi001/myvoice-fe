import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import styled from 'styled-components';
import 'react-calendar/dist/Calendar.css';
import { AppDispatch, RootState } from '../store';
import { fetchRoutines, fetchRoutineById } from '../store/routineSlice';
import { addProgress, fetchProgress } from '../store/progressSlice';
import { RoutineData } from '../models/Routine';
import { ProgressData } from '../models/Progress';

const CalendarContainer = styled.div`
  .react-calendar {
    width: 100%;
    max-width: 600px;
    border: none;
    font-family: Arial, sans-serif;
    margin: 20px auto;
  }
  .exercise-day {
    background: #4caf50 !important;
    color: white !important;
    border-radius: 50%;
  }
  .details {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    max-width: 600px;
    margin: 20px auto;
  }
  .form {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 300px;
    margin: 20px auto;
  }
  .form input,
  .form select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .form button {
    padding: 10px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
`;

const ExerciseCalendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { routines, loading: routineLoading, error: routineError } = useSelector((state: RootState) => state.routine);
  const { progress, loading: progressLoading, error: progressError } = useSelector((state: RootState) => state.progress);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newRoutineId, setNewRoutineId] = useState('');
  const [newDayId, setNewDayId] = useState('');
  const [newExerciseId, setNewExerciseId] = useState('');
  const [newSets, setNewSets] = useState<number>(1);
  const [newReps, setNewReps] = useState<number>(1);
  const [newRepsUnit, setNewRepsUnit] = useState<'count' | 'seconds'>('count');
  const [newWeight, setNewWeight] = useState<number>(0);
  const [newWeightUnit, setNewWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [newNotes, setNewNotes] = useState('');
  const [newCompleted, setNewCompleted] = useState<boolean>(false);
  const [days, setDays] = useState<RoutineData['days']>([]);
  const [exercises, setExercises] = useState<RoutineData['days'][0]['exercises']>([]);

  // Fetch routines and progress
  useEffect(() => {
    dispatch(fetchRoutines());
    dispatch(fetchProgress());
  }, [dispatch]);

  // Update days when routine changes
  useEffect(() => {
    if (newRoutineId) {
      dispatch(fetchRoutineById(newRoutineId)).then((action) => {
        if (fetchRoutineById.fulfilled.match(action)) {
          setDays(action.payload.days);
        }
      });
    } else {
      setDays([]);
      setExercises([]);
    }
  }, [newRoutineId, dispatch]);

  // Update exercises when day changes
  useEffect(() => {
    if (newDayId) {
      const selectedDay = days.find((day) => day._id === newDayId);
      setExercises(selectedDay?.exercises || []);
    } else {
      setExercises([]);
    }
  }, [newDayId, days]);

  // Highlight exercise days
  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split('T')[0];
    return progress.some((ex) => new Date(ex.date).toISOString().split('T')[0] === dateStr)
      ? 'exercise-day'
      : null;
  };

  // Handle date selection
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Calculate completion percentage
  const calculateCompletion = (dayExercises: ProgressData[]) => {
    if (!dayExercises.length) return 0;
    const completed = dayExercises.filter((ex) => ex.completed).length;
    return Math.round((completed / dayExercises.length) * 100);
  };

  // Add new progress entry
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineId || !newDayId || !newExerciseId) return;

    const routine = routines.find((r) => r._id === newRoutineId);
    const day = days.find((d) => d._id === newDayId);
    const exercise = exercises.find((ex) => ex._id === newExerciseId);

    const progressData = {
      routineId: newRoutineId,
      routineName: routine?.name || '',
      dayId: newDayId,
      dayName: day?.dayName || '',
      exerciseId: newExerciseId,
      exerciseName: exercise?.name || '',
      sets: newSets,
      reps: newReps,
      repsUnit: newRepsUnit,
      weightUnit: newWeightUnit,
      weight: newWeight,
      notes: newNotes,
      date: selectedDate,
      completed: newCompleted,
    } as unknown as ProgressData;

    dispatch(addProgress(progressData)).then(() => {
      setNewRoutineId('');
      setNewDayId('');
      setNewExerciseId('');
      setNewSets(1);
      setNewReps(1);
      setNewRepsUnit('count');
      setNewWeight(0);
      setNewWeightUnit('kg');
      setNewNotes('');
      setNewCompleted(false);
    });
  };

  // Filter exercises for selected date
  const selectedExercises = progress.filter(
    (ex) => new Date(ex.date).toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
  );

  return (
    <CalendarContainer>
      <Calendar
        onChange={(value)=> {handleDateChange(value as Date)}}
        value={selectedDate}
        tileClassName={tileClassName}
      />
      {(routineLoading || progressLoading) && <p>Loading...</p>}
      {(routineError || progressError) && <p>Error: {routineError || progressError}</p>}
      <div className="details">
        <h3>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h3>
        {selectedExercises.length > 0 ? (
          <>
            <p><strong>Completion:</strong> {calculateCompletion(selectedExercises)}%</p>
            {selectedExercises.map((ex) => (
              <div key={ex._id}>
                <p><strong>Routine:</strong> {ex.routineName}</p>
                <p><strong>Day:</strong> {ex.dayName}</p>
                <p><strong>Exercise:</strong> {ex.exerciseName}</p>
                <p>
                  <strong>Sets:</strong> {ex.sets}, <strong>Reps:</strong> {ex.reps} ({ex.repsUnit})
                </p>
                {ex.weight > 0 && (
                  <p><strong>Weight:</strong> {ex.weight} {ex.weightUnit}</p>
                )}
                {ex.notes && <p><strong>Notes:</strong> {ex.notes}</p>}
                <p><strong>Completed:</strong> {ex.completed ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </>
        ) : (
          <p>No exercises recorded for this day.</p>
        )}
      </div>
      <form className="form" onSubmit={handleAddExercise}>
        <h3>Add Exercise for {selectedDate.toLocaleDateString()}</h3>
        <select
          value={newRoutineId}
          onChange={(e) => setNewRoutineId(e.target.value)}
          required
        >
          <option value="">Select Routine</option>
          {routines.map((routine) => (
            <option key={routine._id} value={routine._id}>{routine.name}</option>
          ))}
        </select>
        <select
          value={newDayId}
          onChange={(e) => setNewDayId(e.target.value)}
          required
          disabled={!newRoutineId}
        >
          <option value="">Select Day</option>
          {days.map((day) => (
            <option key={day._id} value={day._id}>{day.dayName}</option>
          ))}
        </select>
        <select
          value={newExerciseId}
          onChange={(e) => setNewExerciseId(e.target.value)}
          required
          disabled={!newDayId}
        >
          <option value="">Select Exercise</option>
          {exercises.map((ex) => (
            <option key={ex._id} value={ex._id}>{ex.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Sets"
          value={newSets}
          onChange={(e) => setNewSets(Number(e.target.value))}
          min="1"
          required
        />
        <input
          type="number"
          placeholder="Reps"
          value={newReps}
          onChange={(e) => setNewReps(Number(e.target.value))}
          min="1"
          required
        />
        <select
          value={newRepsUnit}
          onChange={(e) => setNewRepsUnit(e.target.value as 'count' | 'seconds')}
        >
          <option value="count">Count</option>
          <option value="seconds">Seconds</option>
        </select>
        <input
          type="number"
          placeholder="Weight"
          value={newWeight}
          onChange={(e) => setNewWeight(Number(e.target.value))}
          min="0"
        />
        <select
          value={newWeightUnit}
          onChange={(e) => setNewWeightUnit(e.target.value as 'kg' | 'lb')}
        >
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
        <input
          type="text"
          placeholder="Notes"
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={newCompleted}
            onChange={(e) => setNewCompleted(e.target.checked)}
          />
          Completed
        </label>
        <button type="submit" disabled={routineLoading || progressLoading}>
          Add Exercise
        </button>
      </form>
    </CalendarContainer>
  );
};

export default ExerciseCalendar;