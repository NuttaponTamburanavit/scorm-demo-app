'use client';
import { useScormStore } from '@/store/useScormStore';
import { ChevronRight, ChevronDown, Database, Info } from 'lucide-react';
import { useState } from 'react';

// Helper to convert flat cmi keys into a nested object
const buildTree = (flatObj: Record<string, any>) => {
  const tree: any = {};
  Object.keys(flatObj).forEach((key) => {
    const parts = key.split('.');
    let current = tree;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = { _value: flatObj[key] };
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  });
  return tree;
};

const TreeItem = ({ name, data, depth = 0 }: { name: string; data: any; depth?: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isLeaf = data && '_value' in data;

  if (isLeaf) {
    return (
      <div className="flex items-center gap-2 py-1 hover:bg-primary/5 rounded px-2 group" style={{ paddingLeft: `${depth * 16 + 24}px` }}>
        <span className="text-gray-500 font-medium text-xs font-mono">{name}:</span>
        <span className="text-primary font-bold text-xs font-mono truncate">
          {data._value === '' ? <span className="text-gray-300 italic">empty</span> : String(data._value)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1.5 hover:bg-gray-100 rounded px-2 transition-colors w-full text-left"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        <span className="text-gray-700 font-semibold text-xs tracking-wide uppercase">{name}</span>
      </button>
      {isOpen && (
        <div className="flex flex-col">
          {Object.entries(data).map(([key, value]) => (
            <TreeItem key={key} name={key} data={value} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const CmiExplorer = () => {
  const { cmi } = useScormStore();
  const tree = buildTree(cmi);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-[280px]">
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-800 tracking-tight">
          <Database size={18} className="text-primary" />
          <span>CMI Explorer</span>
        </div>
        <div className="group relative">
          <Info size={14} className="text-gray-400 cursor-help" />
          <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-gray-900 text-[10px] text-gray-300 rounded shadow-lg invisible group-hover:visible z-10">
            Visualizes real-time SCORM Data Model communication.
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
        {Object.keys(cmi).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2 p-8">
            <Database size={32} className="opacity-20" />
            <p className="text-[10px] text-center font-medium italic">
              No data received from content yet.<br />Interact with the course to see updates.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {Object.entries(tree).map(([key, value]) => (
              <TreeItem key={key} name={key} data={value} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
