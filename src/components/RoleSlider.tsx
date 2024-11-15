import React from 'react';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import { Role } from '../types';
import { FaSearch, FaHammer } from 'react-icons/fa';

interface RoleSliderProps {
    role: Role;
    setRole: (role: Role) => void;
}


const RoleSlider: React.FC<RoleSliderProps> = ({ role, setRole }) => {
    return (
        <div className="flex items-center space-x-3">
            <Toggle
                checked={role === Role.QA}
                onChange={() => setRole(role === Role.Developer ? Role.QA : Role.Developer)}
                icons={{
                    checked: <FaSearch />,
                    unchecked: <FaHammer />
                }}
                className="custom-toggle"
            />
        </div>
    );
};

export default RoleSlider;