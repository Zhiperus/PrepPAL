import React, { useState, useRef } from 'react';

// insert modal to dashboard:
/*
    <button 
      onClick={() => setIsModalOpen(true)}
      className="btn btn-primary btn-lg shadow-xl hover:scale-105 transition-transform"
    >
        Update Go-Bag
    </button>

    {isModalOpen && (
      <ProgressModal 
          onClose={() => setIsModalOpen(false)} 
      />
    )}
*/

// currently manual input for task checklist
// replace with useBag hook, restructure later

type Task = {
  id: number;
  label: string;
  completed: boolean;
};

export const ProgressModal = ({ onClose }: { onClose: () => void }) => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, label: 'Non-Perishable Food', completed: false },
    { id: 2, label: '1.5L Drinking Water', completed: false },
    { id: 3, label: 'Eating Utensils', completed: false },
    { id: 4, label: 'Band-aid and Sterile Gauze', completed: false },
    { id: 5, label: 'Micropore Tape', completed: false },
    { id: 6, label: 'Disinfectant (Povidone-Iodine and Alcohol)', completed: false },
    { id: 7, label: 'Mefenamic acid and Paracetamol', completed: false },
    { id: 8, label: 'Maintenance Medication', completed: false },
    { id: 9, label: 'Toothbrush, Toothpaste, and Mouthwash', completed: false },
    { id: 10, label: 'Sanitary Napkin', completed: false },
    { id: 11, label: 'Soap, Shampoo, and Conditioner', completed: false },
    { id: 12, label: 'Hand Sanitizer and Alcohol', completed: false },
    { id: 13, label: 'Insect Repellant', completed: false },
    { id: 14, label: 'Sunblock', completed: false },
    { id: 15, label: 'Pocket Knife w/ Can Opener', completed: false },
    { id: 16, label: 'Flashlight / Posporo w/ Lighter', completed: false },
    { id: 17, label: 'Rope', completed: false },
    { id: 18, label: 'Whistle or any noise-making device', completed: false },
    { id: 19, label: 'Safety goggles, dust mask, N95 maks, surgical gloves', completed: false },
    { id: 20, label: 'Kapote / Rain Poncho', completed: false },
    { id: 21, label: 'Small Radio, Extra Batteries, Powerbank, Charger', completed: false },
    { id: 22, label: 'Extra Shoes or Slippers', completed: false },
    { id: 23, label: 'Jacket', completed: false },
    { id: 24, label: 'Blanket and Sleeping Bag', completed: false },
    { id: 25, label: 'Extra Clothes (Good for 3 Days', completed: false }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-white border border-[#2A4263] shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#2A4263] hover:text-[#FFFFFF] hover:bg-[#2A4263]"
        >✕</button>

        <h3 className="text-2xl font-bold text-[#2A4263]">Update Go-Bag Progress</h3>
        <p className="py-2 text-sm opacity-70 text-[#4B5563]">Check completed tasks, and upload a progress photo.</p>

        <form className="mt-4 flex flex-col flex-1 overflow-hidden">
          
          <div className="space-y-2 pr-2 overflow-y-auto max-h-60"> 
            {tasks.map((task) => (
              <label 
                key={task.id} 
                className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all"
              >
                <input 
                  type="checkbox" 
                  className="checkbox border-[#2A4263] checked:bg-[#2A4263] checked:text-white checked:border-[#2A4263]" 
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span className={`font-medium text-[#2A4263] ${task.completed ? 'line-through opacity-40' : ''}`}>
                  {task.label}
                </span>
              </label>
            ))}
          </div>

          <div className="pt-4 mt-4">
            <div className="form-control w-full">
              <label className="label mb-2">
                <span className="label-text font-bold text-[#2A4263]">Evidence Photo</span>
              </label>
              <input 
                type="file" 
                className="file-input file-input-bordered file-input-primary w-full
                bg-white
                file:bg-[#2A4263] file:text-white file:border-none
                border-[#2A4263]
                text-slate-600 text-sm"
                required
              />
            </div>

            <div className="modal-action">
              <button type="submit" className="btn btn-primary px-8 bg-[#2A4263] border-none">Submit</button>
            </div>
          </div>
        </form>
      </div>

      <div className="modal-backdrop bg-black/40" onClick={onClose}></div>
    </div>
  );
};
