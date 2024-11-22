import React from 'react';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import { Role } from '../../types';
import { Wrench , Search } from 'lucide-react';
import {commonStyle} from "../styles/commonStyles.ts";

interface RoleSliderProps {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleSlider: React.FC<RoleSliderProps> = ({ role, setRole }) => {
  const isDeveloper = role === Role.Developer;

  return (
    <div className="flex items-center mb-4" style={commonStyle}>
      <div className="relative" title={isDeveloper ? 'Developer' : 'QA'}>
        <Toggle
          defaultChecked={isDeveloper}
          icons={{
            checked: <Wrench className="w-4 h-4" />,
            unchecked: <Search className="w-4 h-4" />
          }}
          onChange={() => setRole(isDeveloper ? Role.QA : Role.Developer)}
        />
      </div>
    </div>
  );
};

export default RoleSlider;