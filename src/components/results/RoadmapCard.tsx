'use client';

import type { FullAnalysisResponse } from '@/types';

interface RoadmapCardProps {
  roadmap: FullAnalysisResponse['roadmap'];
}

export default function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const weeklyPlan = roadmap.weekly_plan || [];
  
  // DERIVE all stats from actual roadmap data - NO hardcoded values
  const actualWeeks = weeklyPlan.length;
  const totalTasks = weeklyPlan.reduce((sum, w) => sum + w.tasks.length, 0);
  const totalHours = weeklyPlan.reduce(
    (sum, w) => sum + w.tasks.reduce((wSum, t) => wSum + (t.hours || 0), 0),
    0
  );
  const avgHoursPerWeek = actualWeeks > 0 ? Math.round(totalHours / actualWeeks) : 0;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="card">
        <div className="section-header">
          <div className="section-icon bg-cyan-500/20 text-cyan-400">
            🗺️
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Your Learning Roadmap
            </h3>
            <p className="text-sm text-slate-400">
              {totalHours} hours over {actualWeeks} weeks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">
              {actualWeeks}
            </div>
            <div className="text-sm text-slate-400">Weeks</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">
              {avgHoursPerWeek}h
            </div>
            <div className="text-sm text-slate-400">Per Week</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {totalTasks}
            </div>
            <div className="text-sm text-slate-400">Tasks</div>
          </div>
        </div>
      </div>

      {/* Weekly Plan */}
      <div className="space-y-4">
        {weeklyPlan.map((week) => (
          <div key={week.week} className="card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {week.week}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white">
                  Week {week.week}: {week.focus_skill}
                </h4>
                <p className="text-sm text-slate-400">
                  {week.tasks.reduce((sum, t) => sum + t.hours, 0)} hours planned
                </p>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {week.tasks.map((task, taskIndex) => (
                <div
                  key={taskIndex}
                  className="p-4 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600"
                      />
                      <span className="font-medium text-white">
                        {task.title}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {task.hours}h
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 ml-6">
                    {task.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Resources */}
            {week.resources && week.resources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-2">📚 Resources:</p>
                <div className="flex flex-wrap gap-2">
                  {week.resources.map((resource, rIndex) => (
                    <a
                      key={rIndex}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1 bg-slate-600/50 rounded text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {resource.type === 'documentation'
                        ? '📚'
                        : resource.type === 'tutorial'
                        ? '🎓'
                        : resource.type === 'video'
                        ? '🎥'
                        : '📝'}{' '}
                      {resource.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
