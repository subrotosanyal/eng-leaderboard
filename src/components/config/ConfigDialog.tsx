import React, { useState, useEffect } from 'react';
import { GenericJiraService } from '../../services/GenericJiraService';
import type { JiraConfig, JiraField } from '../../types';
import { commonStyle } from '../styles/commonStyles';

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: JiraConfig) => void;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<JiraConfig>({
    project: '',
    board: '',
    developerField: { key: '', name: '', clauseName: '' },
    storyPointField: { key: '', name: '', clauseName: '' },
    testedByField: { key: '', name: '', clauseName: '' },
  });
  const [fields, setFields] = useState<JiraField[]>([]);
  const [searches, setSearches] = useState<{ [key: string]: string }>({
    developerField: '',
    storyPointField: '',
    testedByField: '',
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const storedProject = localStorage.getItem('jiraProject');
    const storedBoard = localStorage.getItem('jiraBoard');
    const storedDeveloperField = localStorage.getItem('jiraDeveloperField');
    const storedStoryPointField = localStorage.getItem('jiraStoryPointField');
    const storedTestedByField = localStorage.getItem('jiraTestedByField');

    setConfig({
      project: storedProject || '',
      board: storedBoard || '',
      developerField: storedDeveloperField ? JSON.parse(storedDeveloperField) : { key: '', name: '' },
      storyPointField: storedStoryPointField ? JSON.parse(storedStoryPointField) : { key: '', name: '' },
      testedByField: storedTestedByField ? JSON.parse(storedTestedByField) : { key: '', name: '' },
    });

    setSearches({
      developerField: storedDeveloperField ? JSON.parse(storedDeveloperField).name : '',
      storyPointField: storedStoryPointField ? JSON.parse(storedStoryPointField).name : '',
      testedByField: storedTestedByField ? JSON.parse(storedTestedByField).name : '',
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFields = async () => {
      try {
        const jiraService = new GenericJiraService();
        const fetchedFields = await jiraService.getJiraFields();
        setFields(fetchedFields);
      } catch (error) {
        console.error('Failed to fetch Jira fields:', error);
      }
    };

    fetchFields();
  }, [isOpen]);

  const handleInputChange = (fieldName: string, value: string) => {
    setConfig((prevConfig) => ({ ...prevConfig, [fieldName]: value }));
  };

  const handleDropdownSearchChange = (fieldName: string, value: string) => {
    setSearches((prev) => ({ ...prev, [fieldName]: value }));
    setActiveDropdown(fieldName);
  };

  const handleDropdownSelect = (fieldName: string, field: JiraField) => {
    setConfig((prevConfig) => ({ ...prevConfig, [fieldName]: field }));
    setSearches((prev) => ({ ...prev, [fieldName]: field.name }));
    setActiveDropdown(null);
  };

  const handleSave = () => {
    localStorage.setItem('jiraProject', config.project);
    localStorage.setItem('jiraBoard', config.board);
    localStorage.setItem('jiraDeveloperField', JSON.stringify(config.developerField));
    localStorage.setItem('jiraStoryPointField', JSON.stringify(config.storyPointField));
    localStorage.setItem('jiraTestedByField', JSON.stringify(config.testedByField));

    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={commonStyle}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-96" style={commonStyle}>
        <h2 className="text-xl font-bold mb-4" style={commonStyle}>Configuration</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1" style={commonStyle}>Project</label>
          <input
            type="text"
            value={config.project}
            onChange={(e) => handleInputChange('project', e.target.value)}
            className="border p-2 rounded w-full"
            style={commonStyle}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1" style={commonStyle}>Board</label>
          <input
            type="text"
            value={config.board}
            onChange={(e) => handleInputChange('board', e.target.value)}
            className="border p-2 rounded w-full"
            style={commonStyle}
          />
        </div>

        {['developerField', 'storyPointField', 'testedByField'].map((fieldName) => (
          <div key={fieldName} className="mb-4 relative" style={commonStyle}>
            <label className="block text-gray-700 mb-1" style={commonStyle}>
              {fieldName === 'developerField' && 'Developer Field Name'}
              {fieldName === 'storyPointField' && 'Story Point Field Name'}
              {fieldName === 'testedByField' && 'Tested By Field Name'}
            </label>
            <input
              type="text"
              placeholder="Search..."
              value={searches[fieldName]}
              onChange={(e) => handleDropdownSearchChange(fieldName, e.target.value)}
              className="border p-2 rounded w-full"
              style={commonStyle}
              onFocus={() => setActiveDropdown(fieldName)}
            />
            {activeDropdown === fieldName && searches[fieldName] && (
              <div
                className="absolute z-10 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto w-full"
                style={commonStyle}
              >
                {fields
                  .filter((field) =>
                    field.name.toLowerCase().includes(searches[fieldName].toLowerCase())
                  )
                  .map((field) => (
                    <div
                      key={field.key}
                      onClick={() => handleDropdownSelect(fieldName, field)}
                      className="cursor-pointer p-2 hover:bg-gray-200"
                      style={commonStyle}
                    >
                      {field.key} - {field.clauseName} - {field.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ConfigDialog;