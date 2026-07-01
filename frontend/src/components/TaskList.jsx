import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onEdit, onDelete, onStatusToggle }) => {
  if (tasks.length === 0) {
    return (
      <div className="no-tasks">
        <h3>No tasks found</h3>
        <p>Try refining your filters or add a new task to get started!</p>
      </div>
    );
  }

  return (
    <div className="tasks-grid">
      {tasks.map(task => (
        <TaskItem
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusToggle={onStatusToggle}
        />
      ))}
    </div>
  );
};

export default TaskList;
