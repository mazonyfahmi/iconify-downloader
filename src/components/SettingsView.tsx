import React from 'react';
import { Settings as SettingsIcon, Monitor, Sun, Moon } from 'lucide-react';

export const SettingsView: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="card bg-base-200 border border-base-300">
                <div className="card-body">
                    <h2 className="card-title mb-6 flex items-center gap-2">
                        <SettingsIcon className="text-primary" />
                        Settings
                    </h2>

                    <div className="space-y-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium uppercase tracking-wider text-base-content/50">Appearance</span>
                            </label>
                            <div className="join w-full grid grid-cols-3">
                                <button className="btn btn-active btn-primary join-item gap-2">
                                    <Monitor size={20} />
                                    System
                                </button>
                                <button disabled className="btn join-item gap-2">
                                    <Sun size={20} />
                                    Light
                                </button>
                                <button disabled className="btn join-item gap-2">
                                    <Moon size={20} />
                                    Dark
                                </button>
                            </div>
                            <label className="label">
                                <span className="label-text-alt text-base-content/50">Only Dark/System mode is currently optimized.</span>
                            </label>
                        </div>

                        <div className="divider"></div>

                        <div className="space-y-4">
                            <label className="label">
                                <span className="label-text font-medium uppercase tracking-wider text-base-content/50">About</span>
                            </label>
                            <div className="bg-base-300 rounded-box p-4 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-base-content/70">Version</span>
                                    <span className="font-mono">1.0.0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-content/70">Electron</span>
                                    <span className="font-mono">v28.0.0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-content/70">React</span>
                                    <span className="font-mono">v18.2.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
