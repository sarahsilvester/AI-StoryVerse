import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Trash2, Shield, Heart } from 'lucide-react';

export default function CharacterLibrary() {
  const { characters, saveCharacter, deleteCharacter, loading } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState('other');
  const [appearance, setAppearance] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !appearance) return;
    
    await saveCharacter({
      name: name.trim(),
      description: description.trim(),
      gender,
      appearance: appearance.trim()
    });

    // Reset Form
    setName('');
    setDescription('');
    setGender('other');
    setAppearance('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Character Library
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Create consistent characters to feature across different stories and panels.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary py-2.5"
        >
          <UserPlus className="w-5 h-5" />
          {showAddForm ? 'View Characters' : 'Create Character'}
        </button>
      </div>

      {showAddForm ? (
        <div className="glass-card p-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-slate-200 mb-6">New Character Sheet</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aria Woods"
                  className="w-full glass-input text-sm"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Gender / Role Style</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full glass-input text-sm bg-dark-900"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="other">Other / Creature</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Role / Background Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A young, determined magic apprentice who seeks lost treasures."
                rows={2}
                className="w-full glass-input text-sm"
              />
            </div>

            {/* Appearance */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Visual Appearance Details (Key for AI consistency)</label>
              <textarea
                required
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="e.g. light skin, green eyes, wearing round glasses, a blue wizard robe, and carrying a wooden staff"
                rows={3}
                className="w-full glass-input text-sm"
              />
              <p className="text-[10px] text-slate-500">
                Be specific about clothing colors, hair color, and items. This description is appended to scene prompts to ensure the character looks the same in every comic panel.
              </p>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-2.5 text-sm"
              >
                Save Character
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary py-2.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {characters.length === 0 ? (
            <div className="glass-card p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="text-slate-600 text-6xl">👥</div>
              <h3 className="text-lg font-bold text-slate-300">No characters saved</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Add characters to your database first! Once created, they can be selected during the story generation step to maintain their visual appearance in the generated scene slides.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary py-2 px-6 text-sm mx-auto"
              >
                Create Your First Character
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((char) => (
                <div key={char._id} className="glass-card p-6 flex flex-col justify-between hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all">
                  <div className="flex gap-4 items-start">
                    <img
                      src={char.avatarUrl}
                      alt={char.name}
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${char.name}`;
                      }}
                      className="w-20 h-20 rounded-2xl object-cover bg-dark-900 border border-slate-800 shadow-md"
                    />
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-200 text-lg">{char.name}</h4>
                      <span className="badge border-brand-violet/30 text-brand-violet bg-brand-violet/5">
                        {char.gender}
                      </span>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {char.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Appearance Details:</div>
                    <p className="text-xs text-slate-300 leading-normal italic line-clamp-2">
                      "{char.appearance}"
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => deleteCharacter(char._id)}
                      className="text-slate-500 hover:text-brand-rose transition-colors p-1.5 rounded-lg hover:bg-brand-rose/10"
                      title="Delete Character"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
