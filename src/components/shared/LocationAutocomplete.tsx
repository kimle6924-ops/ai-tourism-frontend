import { useState, useEffect, useRef } from 'react';
import type { AdministrativeUnit } from '../../services/AdministrativeUnitService';

interface LocationAutocompleteProps {
    items: AdministrativeUnit[];
    value: string; // selected ID
    onChange: (id: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * A searchable autocomplete input for AdministrativeUnit selection.
 * Shows a filtered suggestion list as the user types.
 */
export default function LocationAutocomplete({
    items,
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    disabled = false,
    className = '',
}: LocationAutocompleteProps) {
    // Display text inside the input
    const [inputText, setInputText] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync display text when the external value or items change
    useEffect(() => {
        if (!value) {
            setInputText('');
            return;
        }
        const found = items.find(i => i.id === value);
        if (found) setInputText(found.name);
    }, [value, items]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                // If user typed something but didn't select, restore the previous selection label
                const found = items.find(i => i.id === value);
                setInputText(found ? found.name : '');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [value, items]);

    const filtered = items.filter(item =>
        item.name.toLowerCase().includes(inputText.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        setOpen(true);
        // Clear selection if the user is typing (no exact match yet)
        if (value) {
            const current = items.find(i => i.id === value);
            if (current && e.target.value !== current.name) {
                onChange('');
            }
        }
    };

    const handleSelect = (item: AdministrativeUnit) => {
        setInputText(item.name);
        onChange(item.id);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setOpen(false);
            const found = items.find(i => i.id === value);
            setInputText(found ? found.name : '');
        }
        if (e.key === 'Enter' && filtered.length === 1) {
            e.preventDefault();
            handleSelect(filtered[0]);
        }
    };

    const handleFocus = () => {
        if (!disabled) setOpen(true);
    };

    return (
        <div ref={containerRef} className="relative">
            <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder={disabled ? '—' : placeholder}
                disabled={disabled}
                className={className}
                autoComplete="off"
            />
            {open && !disabled && filtered.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filtered.map(item => (
                        <li
                            key={item.id}
                            onMouseDown={() => handleSelect(item)}
                            className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition ${
                                item.id === value ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700'
                            }`}
                        >
                            {item.name}
                        </li>
                    ))}
                </ul>
            )}
            {open && !disabled && filtered.length === 0 && inputText.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 shadow-lg">
                    Không tìm thấy kết quả
                </div>
            )}
        </div>
    );
}
