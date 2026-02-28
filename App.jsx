import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Check, Clock, ArrowRight, Trash2, ChevronDown, X } from 'lucide-react';

const formatDate = (date) => {
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
};

const getDateKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getTomorrowKey = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getDateKey(tomorrow);
};

const TaskCard = ({ task, onDelete, onComplete, onPostpone, onRemind }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDirection, setExitDirection] = useState(null);
  
  const startX = useRef(0);
  const SWIPE_THRESHOLD = 80;
  const DELETE_THRESHOLD = -100;

  const handleStart = useCallback((clientX) => {
    if (showActions || showReminder) return;
    setIsDragging(true);
    startX.current = clientX;
  }, [showActions, showReminder]);

  const handleMove = useCallback((clientX) => {
    if (!isDragging) return;
    setDragX(clientX - startX.current);
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX < DELETE_THRESHOLD) {
      setExitDirection('left');
      setIsExiting(true);
      setTimeout(() => onDelete(task.id), 280);
    } else if (dragX > SWIPE_THRESHOLD) {
      setShowActions(true);
    }
    setDragX(0);
  }, [isDragging, dragX, task.id, onDelete]);

  const onTouchStart = (e) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e) => handleMove(e.touches[0].clientX);
  const onTouchEnd = () => handleEnd();
  const onMouseDown = (e) => handleStart(e.clientX);
  const onMouseMove = (e) => { if (isDragging) { e.preventDefault(); handleMove(e.clientX); } };
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => { if (isDragging) handleEnd(); };

  const handleComplete = () => {
    setShowActions(false);
    setExitDirection('right');
    setIsExiting(true);
    setTimeout(() => onComplete(task.id), 280);
  };

  const handlePostpone = () => {
    setShowActions(false);
    setExitDirection('right');
    setIsExiting(true);
    setTimeout(() => onPostpone(task.id), 280);
  };

  const handleRemind = (time) => {
    onRemind(task.id, time);
    setShowReminder(false);
    setShowActions(false);
  };

  const getCardStyle = () => {
    if (isExiting) {
      return {
        transform: `translateX(${exitDirection === 'left' ? '-110%' : '110%'})`,
        opacity: 0,
        transition: 'transform 0.28s ease-out, opacity 0.28s ease-out',
      };
    }
    if (isDragging) return { transform: `translateX(${dragX}px)`, transition: 'none' };
    return { transform: 'translateX(0)', transition: 'transform 0.2s ease-out' };
  };

  const getBackgroundStyle = () => {
    const intensity = Math.min(Math.abs(dragX) / 100, 1);
    if (dragX < -20) return { background: `rgba(239, 68, 68, ${intensity * 0.9})`, justifyContent: 'flex-end' };
    if (dragX > 20) return { background: `rgba(99, 102, 241, ${intensity * 0.9})`, justifyContent: 'flex-start' };
    return { background: 'transparent' };
  };

  const reminderOptions = [
    { label: '30 мин', value: '30 мин' },
    { label: '1 час', value: '1 час' },
    { label: '3 часа', value: '3 часа' },
    { label: 'Вечером', value: 'Вечером' },
    { label: 'Завтра', value: 'Завтра' },
  ];

  return (
    <div className="relative mb-3 select-none" style={{ height: isExiting ? 0 : 'auto', marginBottom: isExiting ? 0 : 12, overflow: 'hidden', transition: isExiting ? 'height 0.28s ease-out, margin 0.28s ease-out' : 'none' }}>
      <div className="absolute inset-0 rounded-2xl flex items-center px-6" style={getBackgroundStyle()}>
        {dragX < -20 && <Trash2 className="text-white ml-auto" size={22} />}
        {dragX > 20 && <Check className="text-white" size={22} />}
      </div>

      {showActions && !showReminder && (
        <div className="absolute inset-0 z-20 rounded-2xl flex items-center justify-center gap-3 px-4" style={{ background: 'linear-gradient(135deg, #1a1a22 0%, #252530 100%)' }}>
          <button onClick={handleComplete} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <Check size={20} className="text-white" />
            <span className="text-xs text-white font-medium">Готово</span>
          </button>
          <button onClick={handlePostpone} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <ArrowRight size={20} className="text-white" />
            <span className="text-xs text-white font-medium">Завтра</span>
          </button>
          <button onClick={() => setShowReminder(true)} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}>
            <Clock size={20} className="text-white" />
            <span className="text-xs text-white font-medium">Напомнить</span>
          </button>
          <button onClick={() => { setShowActions(false); setShowReminder(false); }} className="absolute top-2 right-2 p-2 rounded-full bg-white/10">
            <X size={14} className="text-white/60" />
          </button>
        </div>
      )}

      {showReminder && (
        <div className="absolute inset-0 z-30 rounded-2xl flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #141418 0%, #1e1e26 100%)' }}>
          <span className="text-white/50 text-xs mb-3">Напомнить через:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {reminderOptions.map((opt) => (
              <button key={opt.value} onClick={() => handleRemind(opt.value)} className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowReminder(false)} className="mt-3 px-4 py-2 rounded-lg text-xs text-white/50 bg-white/10">Отмена</button>
        </div>
      )}

      <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave} className="relative p-4 rounded-2xl cursor-grab z-10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)', border: '1px solid rgba(255,255,255,0.08)', ...getCardStyle() }}>
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-white/25 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-white font-medium text-base leading-tight">{task.title}</p>
            {task.reminder && (
              <div className="flex items-center gap-1.5 mt-2">
                <Clock size={12} className="text-indigo-400" />
                <span className="text-indigo-400 text-xs">{task.reminder}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CompletedSection = ({ tasks, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (tasks.length === 0) return null;

  return (
    <div className="mt-8">
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 text-white/40 text-sm mb-3">
        <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }} />
        <span>Завершённые · {tasks.length}</span>
      </button>
      {isExpanded && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-emerald-400" />
              </div>
              <span className="text-white/35 text-sm line-through">{task.title}</span>
            </div>
          ))}
          <button onClick={onClear} className="w-full py-2.5 text-red-400/50 text-sm">Очистить всё</button>
        </div>
      )}
    </div>
  );
};

const AddTaskModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    else setTitle('');
  }, [isOpen]);

  const handleSubmit = () => {
    if (title.trim()) { onAdd(title.trim()); setTitle(''); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full p-5 pt-4 rounded-t-3xl" style={{ background: 'linear-gradient(180deg, #1c1c24 0%, #141418 100%)', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-5" />
        <h3 className="text-white text-lg font-semibold mb-4">Новая задача</h3>
        <input ref={inputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} placeholder="Что нужно сделать?" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-base outline-none focus:border-indigo-500/50" style={{ fontSize: '16px' }} />
        <div className="flex gap-3 mt-4 pb-4">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl text-white/50 bg-white/5 font-medium">Отмена</button>
          <button onClick={handleSubmit} disabled={!title.trim()} className="flex-1 py-3.5 rounded-xl text-white font-medium disabled:opacity-40" style={{ background: title.trim() ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : 'rgba(99,102,241,0.3)' }}>Добавить</button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)' }}>
      <Check size={28} className="text-indigo-400" />
    </div>
    <p className="text-white/40 text-base">Все задачи выполнены!</p>
    <p className="text-white/20 text-sm mt-1">Отличная работа</p>
  </div>
);

export default function App() {
  const [tasks, setTasks] = useState(() => [
    { id: 1, title: 'Позвонить маме', date: getDateKey(new Date()), reminder: null },
    { id: 2, title: 'Купить продукты', date: getDateKey(new Date()), reminder: null },
    { id: 3, title: 'Закончить презентацию', date: getDateKey(new Date()), reminder: '15:00' },
  ]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const todayKey = getDateKey(today);
  const todayTasks = tasks.filter(t => t.date === todayKey);

  useEffect(() => {
    setTasks(prev => prev.map(task => {
      const [year, month, day] = task.date.split('-').map(Number);
      const taskDate = new Date(year, month, day);
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (taskDate < todayStart) return { ...task, date: todayKey };
      return task;
    }));
  }, []);

  const handleDelete = useCallback((id) => setTasks(prev => prev.filter(t => t.id !== id)), []);
  const handleComplete = useCallback((id) => { setTasks(prev => { const task = prev.find(t => t.id === id); if (task) setCompletedTasks(c => [...c, { ...task, completedAt: Date.now() }]); return prev.filter(t => t.id !== id); }); }, []);
  const handlePostpone = useCallback((id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, date: getTomorrowKey() } : t)), []);
  const handleRemind = useCallback((id, time) => setTasks(prev => prev.map(t => t.id === id ? { ...t, reminder: time } : t)), []);
  const handleAddTask = useCallback((title) => setTasks(prev => [...prev, { id: Date.now(), title, date: todayKey, reminder: null }]), [todayKey]);

  const currentTime = today.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #0c0c10 0%, #111116 50%, #0a0a0e 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
      <div className="absolute top-0 left-1/2 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(60px)', transform: 'translate(-50%, -30%)' }} />

      <div className="flex items-center justify-between px-6 pt-3 pb-1 relative z-10">
        <span className="text-white text-sm font-semibold tracking-tight">{currentTime}</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-px">{[1, 1, 1, 0.3].map((opacity, i) => (<div key={i} className="w-0.5 h-3 rounded-sm" style={{ background: `rgba(255,255,255,${opacity})` }} />))}</div>
          <span className="text-white text-xs font-medium ml-1">5G</span>
          <div className="relative ml-2"><div className="w-6 h-3 rounded border border-white/30 flex items-center p-0.5"><div className="w-4 h-2 bg-white rounded-sm" /></div></div>
        </div>
      </div>

      <header className="px-6 pt-10 pb-6 relative z-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Сегодня</h1>
        <p className="text-white/35 text-base mt-1">{formatDate(today)}</p>
      </header>

      <main className="px-5 pb-36 relative z-10">
        {todayTasks.length === 0 ? <EmptyState /> : todayTasks.map((task) => (<TaskCard key={task.id} task={task} onDelete={handleDelete} onComplete={handleComplete} onPostpone={handlePostpone} onRemind={handleRemind} />))}
        <CompletedSection tasks={completedTasks} onClear={() => setCompletedTasks([])} />
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-5 pb-8 z-40">
        <button onClick={() => setIsModalOpen(true)} className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-white" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', boxShadow: '0 8px 24px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          <Plus size={20} strokeWidth={2.5} />
          <span>Добавить задачу</span>
        </button>
      </div>

      <div className="fixed bottom-2 left-1/2 w-32 h-1 bg-white/15 rounded-full z-50" style={{ transform: 'translateX(-50%)' }} />
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddTask} />
    </div>
  );
}
