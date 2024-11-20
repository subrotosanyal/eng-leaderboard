import React, { useState, useEffect, useRef } from 'react';
import { GenericJiraService } from '../services/GenericJiraService';
import type { JiraConfig, JiraField } from '../types';
import { commonStyle } from './styles/commonStyles.ts';

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: JiraConfig) => void;
  initialConfig: JiraConfig;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [config, setConfig] = useState<JiraConfig>(initialConfig);
  const [fields, setFields] = useState<JiraField[]>([]);
  const [searches, setSearches] = useState<{ [key: string]: string }>({
    developerField: '',
    storyPointField: '',
    testedByField: '',
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const searchBoxRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
    developerField: null,
    storyPointField: null,
    testedByField: null,
  });

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const jiraService = new GenericJiraService();
        const fetchedFields = await jiraService.getJiraFields();
        setFields(fetchedFields);
      } catch (error) {
        console.error('Error fetching JIRA fields:', error);
      }
    };

    if (isOpen) fetchFields();
  }, [isOpen]);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    if (activeDropdown && searchBoxRefs.current[activeDropdown]) {
      searchBoxRefs.current[activeDropdown]?.focus(); // Keep focus in the active search box
    }
  }, [searches, activeDropdown]);

  const handleSearchChange = (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearches((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleDropdownChange = (name: string, value: JiraField) => {
    setConfig((prevConfig) => ({ ...prevConfig, [name]: value }));
    setSearches((prev) => ({ ...prev, [name]: value.name })); // Display selected value
    setActiveDropdown(null);
  };

  const handleSubmit = () => {
    onSave(config);
    localStorage.setItem('jiraDeveloperField', JSON.stringify(config.developerField));
    localStorage.setItem('jiraStoryPointField', JSON.stringify(config.storyPointField));
    localStorage.setItem('jiraTestedByField', JSON.stringify(config.testedByField));
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

  const ConfigDropdownField: React.FC<{ label: string; name: string; value: JiraField | null; onChange: (name: string, value: JiraField) => void }> = ({ label, name, onChange }) => (
      <div className="mb-4 relative">
        <label className="block text-gray-700">{label}</label>
        <input
            ref={(el) => (searchBoxRefs.current[name] = el)}
            type="text"
            placeholder="Search..."
            value={searches[name]}
            onChange={handleSearchChange(name)}
            className="border p-2 rounded w-full"
            style={commonStyle}
            onFocus={() => setActiveDropdown(name)}
        />
        {activeDropdown === name && (
            <div
                className="absolute z-10 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto w-full"
                style={commonStyle}
            >
              {fields
                  .filter((field) =>
                      field.key.toLowerCase().includes(searches[name].toLowerCase()) ||
                      field.clauseName.toLowerCase().includes(searches[name].toLowerCase()) ||
                      field.name.toLowerCase().includes(searches[name].toLowerCase())
                  )
                  .map((field) => (
                      <div
                          key={field.key}
                          onClick={() => onChange(name, field)}
                          className="cursor-pointer p-2 hover:bg-gray-200"
                      >
                        {field.key} - {field.clauseName} - {field.name}
                      </div>
                  ))}
            </div>
        )}
      </div>
  );

  return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96" style={commonStyle}>
          <h2 className="text-xl font-bold mb-4">Configuration</h2>
          <ConfigInputField label="Project" name="project" value={config.project} onChange={(e) => setConfig({ ...config, project: e.target.value })} />
          <ConfigInputField label="Board" name="board" value={config.board} onChange={(e) => setConfig({ ...config, board: e.target.value })} />
          <ConfigDropdownField
              label="Developer Field Name"
              name="developerField"
              value={config.developerField || null}
              onChange={handleDropdownChange}
          />
          <ConfigDropdownField
              label="Story Point Field Name"
              name="storyPointField"
              value={config.storyPointField || null}
              onChange={handleDropdownChange}
          />
          <ConfigDropdownField
              label="Tested By Field Name"
              name="testedByField"
              value={config.testedByField || null}
              onChange={handleDropdownChange}
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
