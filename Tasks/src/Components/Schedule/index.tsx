import { useEffect, useState, useRef } from 'react'
import { Calendar } from '../Calendar'
import { Task } from '../Task'
import { TTask } from '../Types/types'
import { VscCalendar } from 'react-icons/vsc'
import { MinCalendar } from '../MinCalendar'
import { BiRightArrow, BiLeftArrow } from 'react-icons/bi'
import './style.css'


const daysOfWeek = [
  ['Domingo','Sunday'],
  ['Segunda','Monday'],
  ['Terça','Tuesday'],
  ['Quarta','Wednesday'],
  ['Quinta','Thursday'],
  ['Sexta','Friday'],
  ['Sábado','Sarturday'],
]

export function Schedule() {
  

  const [addTaskOpen, setAddTaskOpen] = useState<boolean>(false)
  const [selectorDeadlineOpen, setSelectorDeadlineOpen] = useState<boolean>(false)
  const [deadlineNewTask, setDeadlineNewTask] = useState<Date>(new Date)
  const [descriptionNewTask, setDescriptionNewTask] = useState<string>('')
  const [date, setDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<TTask[]>([]);
  const [stateSchedule, setStateSchedule] = useState<Boolean>(false)
  const inputDescriptionNewTask = useRef<HTMLInputElement>(null)
  
  const fetchInBackEnd = async () => {    
    const url = `https://tasks-api-production-ad11.up.railway.app/?date=${date.toLocaleDateString()}`
    const currentDay = await fetch(url)
    const currentTasks = await currentDay.json() ?? []
    setTasks(currentTasks);    
  }

  useEffect(() => {
    fetchInBackEnd()
    setSelectorDeadlineOpen(false)
    setAddTaskOpen(false)
  }, [date, stateSchedule])
  
  const changeStatus = async (idTask: number, newStatus: string, dateCompleted: string) => {
    const url = 'https://tasks-api-production-ad11.up.railway.app/'

    await fetch(url,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'PUT',      
      body: JSON.stringify(
        {
          date: date.toLocaleDateString(),
          idTask,
          newStatus,
          dateCompleted
        })
    })
    setStateSchedule(!stateSchedule)
  }

  const removeTask = async (idTask: number) => {
    const url = 'https://tasks-api-production-ad11.up.railway.app/'

    await fetch(url,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'DELETE',      
      body: JSON.stringify(
        {
          date: date.toLocaleDateString(),
          idTask          
        })
    })
    setStateSchedule(!stateSchedule)
  }

  const saveNewTask = async (description: string, deadline: string) => {
    const newTask = {      
      date: date.toLocaleDateString(),
      status: 'Pending',
      dateCreated: new Date().toLocaleDateString(),
      dateCompleted: '',
      deadline,
      description
    }

    const url = 'https://tasks-api-production-ad11.up.railway.app/'
    await fetch(url,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(newTask)
    })
    
    inputDescriptionNewTask.current?.value && (
      inputDescriptionNewTask.current.value = ''
    )

    fetchInBackEnd()
    setDescriptionNewTask('')
    setDeadlineNewTask(date)
    setStateSchedule(!stateSchedule) 
  }
  
  const btNewTask = (
    <button
      className='btNewTask'
      onClick={() => setAddTaskOpen(!addTaskOpen)}>
      New Task
    </button>
  )

  const selectorDeadline = (
    <div className='selectorDeadline'>
      <MinCalendar
        date={deadlineNewTask}
        setDate={setDeadlineNewTask}        
      />
    </div>
  );

  const btSave = (
    <button
      className='btSave'
      onClick={
        () => {
          saveNewTask(descriptionNewTask, deadlineNewTask.toLocaleDateString())
        }
      }
    >
      Save
    </button>
  );

  const addTask = (
    <div className='addTask'
      onClick={e => e.stopPropagation()}
    >
      <div className='inputs'>
        <input
          autoFocus={true}
          ref={inputDescriptionNewTask}
          className='inputDescriptionNewTask'
          type='text'
          onChange={(e) => setDescriptionNewTask(e.target.value)}
        />
        <div
          className='inputDeadlineNewTask'
          title='Deadline'
        >
          <p>Deadline {deadlineNewTask.toLocaleDateString()}</p>
          <VscCalendar
            className='btSelectorDeadline'
            onClick={() => setSelectorDeadlineOpen(!selectorDeadlineOpen)}
          />
          {selectorDeadlineOpen && selectorDeadline}
        </div>
      </div>
      {btSave}
    </div>
  )

  const nextDay = () => {
    setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1))
  }

  const dayPrevious = () => {
    setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1))
  }


  return (
    <div className='schedule'>
      <Calendar
        date={date}
        setDate={setDate}
      />
      <div className='titleCalendar'>
        <BiLeftArrow
          onClick={(e) => {
              e.stopPropagation() 
              dayPrevious()
            }
          }
        />
        <div className='titleCalendarContent'>
          <h1>{daysOfWeek[date.getDay()][0]}</h1>
          <span className='currentDate'>
            {date.toLocaleDateString()}
          </span>
        </div>
        <BiRightArrow
          onClick={(e) => {
            e.stopPropagation()
            nextDay()
            }
          }
        />
      </div>
      {
        tasks?.map(
          task =>
            <Task
              key={task.id}
              task={task}
              changeStatus={
                (newStatus: string, dateCompleted: string) => {
                  changeStatus(task.id, newStatus, dateCompleted)
                }
              }
              removeTask={
                () => removeTask(task.id)
              }
            />
        )
      }
      {btNewTask}
      {addTaskOpen && addTask}
    </div>
  )
}
