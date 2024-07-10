import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function App() {
  

  const [allTasks, setTasks] = useLocalStorage('taskList',[]);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDailyness, setNewDailyness] = useState(false);
  const [editedTask, setEditedTask] = useState('');
  const [isCompletedButtonPositive, setIsCompletedButtonPositive] = useState(false);
  const [completedTasks, setCompletedTasks] = useLocalStorage('completedTaskList',[]);
  const [resetHour, setResetHour] = useState('00');
  const [resetMinute, setResetMinute] = useState('00');
  const [resetSecond, setResetSecond] = useState('00');
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  const toggleHamburgerMenu = () => {
    setIsHamburgerOpen((open) => !open)
  }

  const completeButtonHandler = () => {
    setIsCompletedButtonPositive(prevState => !prevState)
  }

  const completeTheTask = (indexToComplete) => {
    const completedTask = allTasks[indexToComplete];
    setTasks(prevTasks => prevTasks.filter((_, index) => index !== indexToComplete));
    setCompletedTasks(prevCompletedTasks => [...prevCompletedTasks, { ...completedTask, completedBeforeReset: true/*, addedToday: false*/ }]);
  };

  const incompleteTheTask = (indexToIncomplete) => {
    const incompletedTask = completedTasks[indexToIncomplete];
    setCompletedTasks(prevCompletedTasks => prevCompletedTasks.filter((_, index) => index !== indexToIncomplete));
    setTasks(prevTasks => [...prevTasks, { ...incompletedTask, completedBeforeReset: false }]);
  };


  

  const addTaskToList = () => {
    let newTask = {
      name: newName,
      description: newDescription,
      dailyness: newDailyness,
      resetHour: `${resetHour}`,
      resetMinute: `${resetMinute}`,
      resetSecond: `${resetSecond}`,
      completedBeforeReset: false,
      addedToday: true
    };

  const officialResetTime = new Date();
  officialResetTime.setHours(parseInt(resetHour), parseInt(resetMinute), parseInt(resetSecond))


  const currentTime = new Date();

  if (currentTime.getTime() >= officialResetTime.getTime()) {
    // If the current time is after or at the reset time, set resetToday to true
    newTask.resetToday = true;
  } else {
    // If the current time is before the reset time, set resetToday to false
    newTask.resetToday = false;
  }


    setTasks(prevTasks => [...prevTasks, newTask]);

    setNewName('');
    setNewDescription('');
    setNewDailyness(false);
    setResetHour('0');
    setResetMinute('0');
    setResetSecond('0');

    console.log(newTask);
  };

  const newNameHandler = e =>{
    setNewName(e.target.value)
  };

  const newDescriptionHandler = e =>{
    setNewDescription(e.target.value)
  }

  const newDailynessHandler = e => {
    setNewDailyness(e.target.checked)
  }

  const handleResetTimeChange = (e) => {
    const { value } = e.target;
    const [newResetHour, newResetMinute, newResetSecond] = value.split(":");
    setResetHour(newResetHour || '00');
    setResetMinute(newResetMinute || '00');
    setResetSecond(newResetSecond || '00');
  };

  const deleteTask = (indexToRemove) => {
 
    setTasks(prevTasks => prevTasks.filter((_,index) => index !== indexToRemove));
  };

  const editTask = (index) => {

    setEditedTask({ 
      index, 
      name: allTasks[index].name, 
      description: allTasks[index].description, 
      dailyness: 
      allTasks[index].dailyness,
      resetHour: allTasks[index].resetHour,
      resetMinute: allTasks[index].resetMinute,
      resetSecond: allTasks[index].resetSecond, 
      completedBeforeReset: allTasks[index].completedBeforeReset,
      addedToday: allTasks[index].addedToday })
  };
  

  const saveEdit = useCallback(() => {

    if (editedTask['index'] !== null) {
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks];
        updatedTasks[editedTask['index']] = { name: editedTask.name, 
          description: editedTask.description, 
          dailyness: editedTask.dailyness,
          resetHour: editedTask.resetHour,
          resetMinute: editedTask.resetMinute,
          resetSecond: editedTask.resetSecond, 
          completedBeforeReset: editedTask.completedBeforeReset,
          addedToday: editedTask.addedToday };
        return updatedTasks;
      });
    };

    setEditedTask({ index: 
      null, name: '',
      description: '', 
      dailyness: false,
      resetHour: '0',
      resetMinute: '0',
      resetSecond: '0', 
      completedBeforeReset: false,
      addedToday: false })
      
  }, [setTasks, editedTask]);


  const handleClick = useCallback((e) => {

    if(editedTask['index'] === null) {
      return;
    } else {
      const isInputField = e.target.classList.contains('editable-input') || e.target.closest('.editable-input');
      const isInputTimeField = e.target.classList.contains('edit-task-reset-time-display') || e.target.closest('edit-task-reset-time-display');
      const isEditButtonClicked = e.target.classList.contains('edit-button');
      
      if(isInputField || isInputTimeField || isEditButtonClicked) {
        return;
      } else {
        saveEdit();
      }
    }
  }, [saveEdit, editedTask]);
  

  const handleKeyPress = useCallback((e) => {
      if(e.key === 'Enter') {
        saveEdit();
    }
  }, [saveEdit]);

  useEffect(() => {

    if (editedTask['index'] !== null) {
      document.addEventListener('keydown', handleKeyPress);
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('click', handleClick);
    };

  }, [editedTask, saveEdit, handleClick, handleKeyPress]);

  const handleEditedName = (e) =>{
    setEditedTask(prevState => ({
      ...prevState,
      name: e.target.value
    }));
  };

  const handleEditedDescription = (e) => {
    setEditedTask(prevState => ({
      ...prevState,
      description: e.target.value
    }));
  };

  const handleEditedResetTimeChange = (e) => {
    const { value } = e.target;
    const [newResetHour, newResetMinute, newResetSecond] = value.split(":");
    setEditedTask(prevState => ({
      ...prevState,
      resetHour: newResetHour || '00',
      resetMinute: newResetMinute || '00',
      resetSecond: newResetSecond || '00'
    }));
  };
  

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const currentTimeHours = now.getHours();
      const currentTimeMinutes = now.getMinutes();
      const currentTimeSeconds = now.getSeconds();

      
    /*console.log('Checking tasks at:', now.toLocaleTimeString(), allTasks);*/


      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => {
          const resetHour = parseInt(task.resetHour);
          const resetMinute = parseInt(task.resetMinute);
          const resetSecond = parseInt(task.resetSecond);
  
          if (
            resetHour === currentTimeHours &&
            resetMinute === currentTimeMinutes &&
            resetSecond === currentTimeSeconds
          ) {
            console.log(`Updating allTasks: Setting addedToday to false for task: ${task.name}`);
            // Set addedToday to false
            return { ...task, addedToday: false };
          } else {
            return task;
          }
        });
  
        return updatedTasks;
      });
  
      setCompletedTasks(prevCompletedTasks => {
        const updatedCompletedTasks = [];
        const tasksToReset = [];
  
        prevCompletedTasks.forEach((completedTask, index) => {
          const resetHour = parseInt(completedTask.resetHour);
          const resetMinute = parseInt(completedTask.resetMinute);
          const resetSecond = parseInt(completedTask.resetSecond);
  
          if (
            resetHour === currentTimeHours &&
            resetMinute === currentTimeMinutes &&
            resetSecond === currentTimeSeconds
          ) {
            console.log(`Updating completedTasks: Moving task back to allTasks and setting addedToday to false for task: ${completedTask.name}`);
            // Set addedToday to false and prepare to move back to allTasks
            const resetTask = { ...completedTask, addedToday: false };
            tasksToReset.push(resetTask);
          } else {
            updatedCompletedTasks.push(completedTask);
          }
        });
  
        // Move tasks back to allTasks and set their addedToday property to false
        if (tasksToReset.length > 0) {
          console.log(`Moving ${tasksToReset.length} tasks from completedTasks to allTasks`);
          setTasks(prevTasks => [...prevTasks, ...tasksToReset]);
        }
  
        return updatedCompletedTasks;
      });
  
      const newTimeUntilReset = completedTasks.map(task => {
        if (task.dailyness) {
          return getIntervalUntilResetTime(task);
        } else {
          return '';
        }
      });
  
      setTimeUntilReset(newTimeUntilReset);
    }, 1000);
  
    return () => clearInterval(intervalId);
  }, [completedTasks, setCompletedTasks, setTasks]);

  /*useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const currentTimeHours = now.getHours();
      const currentTimeMinutes = now.getMinutes();
      const currentTimeSeconds = now.getSeconds();
  
      completedTasks.forEach((completedTask, index) => {
        const resetHour = parseInt(completedTask.resetHour);
        const resetMinute = parseInt(completedTask.resetMinute);
        const resetSecond = parseInt(completedTask.resetSecond);
  
        if (
          resetHour === currentTimeHours &&
          resetMinute === currentTimeMinutes &&
          resetSecond === currentTimeSeconds
        ) {*/
          /*setCompletedTasks(prevCompletedTasks => {
            const updatedTasks = [...prevCompletedTasks]
            updatedTasks[index] = { ...updatedTasks[index], addedToday: false };
            return updatedTasks
          })*//*
          setCompletedTasks(prevCompletedTasks => [...prevCompletedTasks, { ...completedTask, addedToday: false }])
          setCompletedTasks(prevCompletedTasks =>
            prevCompletedTasks.filter((_, idx) => idx !== index)
          );
          setTasks(prevTasks => [...prevTasks, completedTask]);
          console.log(allTasks)
          }
      });

      if (
        resetHour === currentTimeHours &&
        resetMinute === currentTimeMinutes &&
        resetSecond >= currentTimeSeconds)
         { 
        console.log(allTasks)
      }

      const newTimeUntilReset = completedTasks.map(task => {
        if (task.dailyness) {
          return getIntervalUntilResetTime(task);
        } else {
          return '';
        }
      });
  
      setTimeUntilReset(newTimeUntilReset);

    }, 1000);
  
    return () => clearInterval(intervalId);
  }, [completedTasks, setCompletedTasks, setTasks]);*/
  
  const getIntervalUntilResetTime = (task) => {
    const now = new Date();
    const officialResetTime = new Date(now);
    officialResetTime.setHours(parseInt(task.resetHour), parseInt(task.resetMinute), parseInt(task.resetSecond));
    let timeDifference = officialResetTime.getTime() - now.getTime();

    if (task.addedToday) { // When the task is first added to the list

      officialResetTime.setDate(officialResetTime.getDate() + 1);
      timeDifference = officialResetTime.getTime() - now.getTime();

      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
      
      return  <div className="task-reset-time-display-time-until-reset">
                <h3>Time until reset:</h3> 
                <h4>{hours}:{minutes}:{seconds}</h4>
              </div>

    } else { // After the first reset time has passed
      
      if (task.completedBeforeReset) {
          if (timeDifference <= 0) {
              // Set the reset time for the next day
              officialResetTime.setDate(officialResetTime.getDate() + 1);
              timeDifference = officialResetTime.getTime() - now.getTime();
          }
          const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
          
          return  <div className="task-reset-time-display-time-until-reset">
                    <h3>Time until reset:</h3> 
                    <h4>{hours}:{minutes}:{seconds}</h4>
                  </div>

      } else {

          if (timeDifference > 0) {
              // Display time until reset
              const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

              return  <div className="task-reset-time-display-time-until-reset">
                        <h3>Time until reset:</h3> 
                        <h4>{hours}:{minutes}:{seconds}</h4>
                      </div>

          } else {
            
              // Display elapsed time since reset
              timeDifference = now.getTime() - officialResetTime.getTime();
              const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

              return  <div className="elapsed-time-time-display-elapsed-time">
                        <h3>Elapsed time:</h3> 
                        <h4>{hours}:{minutes}:{seconds}</h4>
                      </div>

          }
      }
    }
};




     
  
  
  
  
  
  

  return(

  <div className='App'>
    
    <div className='task-input-header'>


      <div className='title'>
        <h1>To-Do List</h1>
      </div>

      <div className='task-input-tools'>
        
        <div className='task-input-text-wrapper'>

          <div className='task-input-item'>
            <div className='task-input-field-and-label'>
                <label>Task Name</label>
                <input type='text' placeholder='Enter Task' value={newName} onChange={newNameHandler} ></input>
            </div>
          </div>
            
          <div className='task-input-item'>
            <div className='task-input-field-and-label'>
                <label>Description</label>
                <input type='text' placeholder='Enter Description' value={newDescription} onChange={newDescriptionHandler} ></input>
            </div>
          </div>
        
        </div>

        <div className='input-daily-settings'>
            <div className='task-input-checkbox'>
              <label className='task-input-daily-settings-label'>Daily Reset Time</label>
              <input title="checkbox" type='checkbox' id="dailynessCheck" onChange={newDailynessHandler} checked={newDailyness}/>
              <label htmlFor='dailynessCheck' className='dailynessCheck-button'></label>
            </div>

            <div className='when-daily-wrapper'>
          
              <div className={newDailyness ? 'when-daily-conditional-open' : 'when-daily-conditional-closed'}>
                <div className='task-input-item-reset-timer'>
                    <h2>Select a Daily Reset Time</h2>
                    <h4>Completed tasks will reset at the daily reset time</h4>
                    <input className='reset-time-input' type='time' value={`${resetHour.padStart(2, '0')}:${resetMinute.padStart(2, '0')}:${resetSecond.padStart(2, '0')}`} step='1' onChange={handleResetTimeChange} />
                      
                  </div>
                </div>
            </div>

        </div>

        <div>
          <button className='add-button' onClick={addTaskToList}>Add</button>
        </div>

      </div>

    </div>


    <div className='task-input-header-800px'>

      <div className='title-800px'>
        <h1>To-Do List</h1>
      </div>

      <div className='task-input-tools-800px'>

        <div className={isHamburgerOpen ? 'open-hamburger-menu' : 'closed-hamburger-menu'}>

          <div className={isHamburgerOpen ? 'hamburger-menu-button-close-wrapper' : 'hamburger-menu-button-wrapper'}>

            <div className={isHamburgerOpen ? 'close-hamburger-button' : 'hamburger-button'} onClick={toggleHamburgerMenu}>

              <span className={isHamburgerOpen ? 'close-hamburger-button-top' : 'hamburger-button-top'}></span>
              <span className={isHamburgerOpen ? 'close-hamburger-button-middle' : 'hamburger-button-middle'}></span>
              <span className={isHamburgerOpen ? 'close-hamburger-button-bottom' : 'hamburger-button-bottom'}></span>

            </div>

          </div>

          <h2 className='hamburger-menu-title'>Add Task</h2>
                    
                  
          <div className='task-input-text-wrapper-800px'>

            <div className='task-input-item-800px'>
              <div className='task-input-field-and-label'>
                  <label>Task Name</label>
                  <input type='text' placeholder='Enter Task' value={newName} onChange={newNameHandler} ></input>
              </div>
            </div>
              
            <div className='task-input-item-800px'>
              <div className='task-input-field-and-label'>
                  <label>Description</label>
                  <input type='text' placeholder='Enter Description' value={newDescription} onChange={newDescriptionHandler} ></input>
              </div>
            </div>

          </div>

          <div className='input-daily-settings-800px'>
            <div className='task-input-checkbox-800px'>
              <label  className='task-input-daily-settings-label-800px'>Daily Reset Time</label>
              <input title="checkbox" type='checkbox' id="dailynessCheck" onChange={newDailynessHandler} checked={newDailyness}/>
              <label htmlFor='dailynessCheck' className='dailynessCheck-button-800px'></label>
            </div>

            <div className='when-daily-wrapper-800px'>


              <div className={newDailyness ? 'when-daily-conditional-open-800px' : 'when-daily-conditional-closed-800px'}>
                <div className='task-input-item-reset-timer-800px'>
                    <h2 htmlFor='dropdown-menu-grid'>Select a Reset Time</h2>
                    <input className='reset-time-input'type='time' value={`${resetHour.padStart(2, '0')}:${resetMinute.padStart(2, '0')}:${resetSecond.padStart(2, '0')}`} step='1' onChange={handleResetTimeChange} />
                </div>
              </div>

            </div>

          </div>

          <div className='add-button-wrapper-800px'>
            <button className='add-button-800px' onClick={addTaskToList}>Add</button>
          </div>


        </div>

      </div>

    </div>


    <div className='list-of-tasks'>

        <div className='list-toggle-button-wrapper'>
          <h2>Show Completed Tasks</h2>
          <input type='checkbox' id='list-toggle-check' onChange={completeButtonHandler} checked={isCompletedButtonPositive}></input>
          <label htmlFor='list-toggle-check' className='list-toggle-button'></label>

        </div>

      <div className='list-of-tasks-header-container'>

        {isCompletedButtonPositive === false ? (

          <div className='list-of-incomplete-tasks-header'>

            {allTasks.length > 0 ?  (
                
                <h2>To Be Completed</h2>

              ) : (

                <h2>No Tasks to be Completed</h2>

              )

            }

          </div>

        ) : (

          <div className='list-of-complete-tasks-header'>

            {completedTasks.length > 0 ? (

                <h2>Completed Tasks</h2>

              ) : (

                <h2>No Completed Tasks</h2>

              )

            }

          </div>

        )}
      

      </div>

      {isCompletedButtonPositive === false && allTasks.length > 0 ? (
  //Remember that the <div> below is an element of 'list-of-tasks' despite the conditional statement above
        <div className='completed-vs-uncompleted-lists'>



          
            <div className='list-of-uncompleted-tasks'>
              
              {allTasks.map((task,index) => {
          
                      return(
          
                      <div key={index}>
          
                          <div className='list-of-tasks-item-wrapper'>
                          
                          {editedTask['index'] === index ? (
          
                              <div className='list-of-edited-tasks-item'>
                                  
                                  <div className='edit-fields'>
                                      <input type='text' className='editable-input' value={editedTask.name} onChange={handleEditedName} />
                                      <input type='text' className='editable-input' value={editedTask.description} onChange={handleEditedDescription} />
                                  </div>
          
                                  <div className='uncompleted-task-edit-reset-time-display'>
          
                                  {task.dailyness && (
          
                                      <input className='edit-task-reset-time-display' type='time' value={`${editedTask.resetHour.padStart(2, '0')}:${editedTask.resetMinute.padStart(2, '0')}:${editedTask.resetSecond.padStart(2, '0')}`} step='1' onChange={handleEditedResetTimeChange} />
          
                                  )}
          
                                  </div>
          
                              </div>
                              
                          ) : (
          
                              <div className='list-of-tasks-item'>
                                  
                                  <div className='list-of-tasks-item-text'>
                                      <h3>{task && task.name}</h3>
                                      <p>{task && task.description}</p>
                                  </div>
          
                                  <div className='task-reset-time-display'>
                                      {task.dailyness && (
                                          <small>{getIntervalUntilResetTime(task)}</small>
                                      )}
                                  </div>
          
                                  <div className='icons'>
                                  <button className='delete-button' onClick = {() => deleteTask(index)}>Delete</button>
                                  <button className='edit-button' onClick ={() => editTask(index)}>Edit</button>
                                  <button className='complete-button' onClick={() => completeTheTask(index)}>Complete</button>
                                  </div>
                                  
                              </div>
          
                          )}
          
                          </div>
                          
                      </div>
                      )
                  })
              }
          
          
            </div>
        </div>          
      ) : (
        <div className='uncompleted-list-no-tasks-conditional'>
          {isCompletedButtonPositive === false && allTasks.length === 0 ? (
            <h4>Way to go!</h4>
          ) : (
            <></>
          )}
        </div>
      )}

      {isCompletedButtonPositive === true && completedTasks.length > 0 ? (
  //Remember that the <div> below is an element of 'list-of-tasks' despite the conditional statement above
        <div className='completed-vs-uncompleted-lists'>


            <div className='list-of-completed-tasks'>
              {completedTasks.length > 0 ? (
                <div className='list-of-completed-tasks'>
                  {completedTasks.map((completedTask,index) => {
                    return(
                      <div key={index}>
                        <div className='list-of-tasks-item'>
                          <div className='list-of-tasks-item-text'>
                            <h3>{completedTask.name}</h3>
                            <p>{completedTask.description}</p>
                          </div>
                          <div className='task-reset-time-display'>
                            {completedTask.dailyness && (
                                <small>
                                  <h3>Reset Time:</h3>
                                  <h4>{completedTask.resetHour}:{completedTask.resetMinute}:{completedTask.resetSecond}</h4>
                                </small>
                            )}
                          </div>
                          <div className='completed-icons'>
                            <button className='mark-as-incomplete-button' onClick={() => incompleteTheTask(index)}>Reset</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                </div>

              ) : (

                <></>
              )}

            </div>

          

        </div>

      ) : (

        <div className='completed-list-no-tasks-conditional'>
          {isCompletedButtonPositive === true && completedTasks.length === 0 ? (
            <div className='no-completed-tasks-message'>
              <h4>You <span className='italic-writing'>really</span> haven't completed anything yet?</h4>
              
            </div>
          ) : (
            <></>
          )}
        </div>

      )}

    </div>
     


  </div>

  )
};



export default App;




/* 
WHAT I STILL NEED TO DO:

DONE! - Delete Tasks

DONE! - Edit Tasks

DONE! - Save Tasks to Local Storage (when refreshed, it's all good)

DONE! - Task Dailyness (is daily, is not daily)

DONE! - Internal Clock for when to reset Tasks

DONE! - Improve CSS

*/