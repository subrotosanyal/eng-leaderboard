import React, { useState } from 'react';
import type { JiraConfig } from '../types';

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: JiraConfig) => void;
  initialConfig: JiraConfig;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [config, setConfig] = useState<Omit<JiraConfig, 'baseUrl'>>(initialConfig);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prevConfig => ({ ...prevConfig, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(config as JiraConfig);
    localStorage.setItem('jiraBoard', config.board);
    localStorage.setItem('jiraStoryPointField', config.storyPointField);
    localStorage.setItem('jiraDeveloperField', config.developerField);
    localStorage.setItem('jiraTestedByField', config.testedByField); // Add this line
    localStorage.setItem('jiraProject', config.project);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Configuration</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Project</label>
          <input
            type="text"
            name="project"
            value={config.project}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Board</label>
          <input
            type="text"
            name="board"
            value={config.board}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Developer Field Name</label>
          <input
            type="text"
            name="developerField"
            value={config.developerField}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Story Point Field Name</label>
          <input
            type="text"
            name="storyPointField"
            value={config.storyPointField}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Tested By Field Name</label> {/* Add this block */}
          <input
            type="text"
            name="testedByField"
            value={config.testedByField}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ConfigDialog;