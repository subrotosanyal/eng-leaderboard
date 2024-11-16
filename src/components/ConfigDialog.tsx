import React, { useState } from 'react';
import type { JiraConfig } from '../types';
import { commonStyle } from './styles/commonStyles.ts';

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
    localStorage.setItem('jiraTestedByField', config.testedByField);
    localStorage.setItem('jiraProject', config.project);
    onClose();
  };

  if (!isOpen) return null;

  const ConfigInputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, value, onChange }) => (
    <div className="mb-4">
      <label className="block text-gray-700">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="border p-2 rounded w-full"
        style={commonStyle}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96" style={commonStyle}>
        <h2 className="text-xl font-bold mb-4">Configuration</h2>
        <ConfigInputField
          label="Project"
          name="project"
          value={config.project}
          onChange={handleChange}
        />
        <ConfigInputField
          label="Board"
          name="board"
          value={config.board}
          onChange={handleChange}
        />
        <ConfigInputField
          label="Developer Field Name"
          name="developerField"
          value={config.developerField}
          onChange={handleChange}
        />
        <ConfigInputField
          label="Story Point Field Name"
          name="storyPointField"
          value={config.storyPointField}
          onChange={handleChange}
        />
        <ConfigInputField
          label="Tested By Field Name"
          name="testedByField"
          value={config.testedByField}
          onChange={handleChange}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ConfigDialog;