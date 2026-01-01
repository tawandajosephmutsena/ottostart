import React from 'react';
import { usePerformanceDebugger } from '@/hooks/useAnimationPerformance';

/**
 * Animation Performance Debugger Component
 * Shows real-time performance metrics in development mode
 */
export const AnimationPerformanceDebugger: React.FC = () => {
    const { debugInfo, isVisible, setIsVisible, recommendations } = usePerformanceDebugger();

    if (process.env.NODE_ENV !== 'development' || !isVisible || !debugInfo) {
        return null;
    }

    const { frameRate, animations, memory } = debugInfo;

    return (
        <div className="fixed top-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs font-mono">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm">Animation Performance</h3>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-white"
                >
                    ×
                </button>
            </div>

            {/* Frame Rate */}
            <div className="mb-3">
                <h4 className="font-semibold text-yellow-400 mb-1">Frame Rate</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div>Current: <span className={frameRate.current < 30 ? 'text-red-400' : 'text-green-400'}>{frameRate.current} FPS</span></div>
                    <div>Average: <span className={frameRate.average < 30 ? 'text-red-400' : 'text-green-400'}>{frameRate.average} FPS</span></div>
                    <div>Min: {frameRate.min} FPS</div>
                    <div>Max: {frameRate.max} FPS</div>
                </div>
            </div>

            {/* Memory Usage */}
            {memory && (
                <div className="mb-3">
                    <h4 className="font-semibold text-blue-400 mb-1">Memory Usage</h4>
                    <div>Used: {memory.usedMB} MB</div>
                    <div>Total: {memory.totalMB} MB</div>
                    <div>Trend: <span className={memory.trend > 1024 * 1024 ? 'text-red-400' : 'text-green-400'}>
                        {memory.trend > 0 ? '+' : ''}{Math.round(memory.trend / 1024)} KB
                    </span></div>
                </div>
            )}

            {/* Animation Stats */}
            {Object.keys(animations).length > 0 && (
                <div className="mb-3">
                    <h4 className="font-semibold text-purple-400 mb-1">Animations</h4>
                    <div className="max-h-32 overflow-y-auto">
                        {Object.entries(animations).map(([name, stats]: [string, any]) => (
                            <div key={name} className="mb-1">
                                <div className="text-gray-300">{name}</div>
                                <div className="text-xs text-gray-400">
                                    Avg: {stats.averageDuration}ms | Count: {stats.count}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div>
                    <h4 className="font-semibold text-orange-400 mb-1">Recommendations</h4>
                    <div className="max-h-24 overflow-y-auto">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="text-xs text-gray-300 mb-1">
                                • {rec}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-gray-400">
                Press Ctrl+Shift+P to toggle
            </div>
        </div>
    );
};

export default AnimationPerformanceDebugger;