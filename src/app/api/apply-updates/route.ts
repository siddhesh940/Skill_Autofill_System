import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Apply updates to GitHub and/or Portfolio
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { 
      analysis_id,
      apply_to_github = false,
      github_repo_name,
      apply_to_portfolio = false,
      github_tasks,
      portfolio_updates 
    } = body;

    const results: {
      github_issues_created?: number;
      portfolio_updated?: boolean;
      errors: string[];
    } = {
      errors: [],
    };

    // Apply to GitHub (create issues)
    if (apply_to_github && github_tasks && github_repo_name) {
      try {
        const githubToken = process.env.GITHUB_TOKEN;
        
        if (!githubToken) {
          results.errors.push('GitHub token not configured');
        } else {
          let issuesCreated = 0;
          
          for (const issue of github_tasks.issues || []) {
            try {
              const response = await fetch(
                `https://api.github.com/repos/${github_repo_name}/issues`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    title: issue.title,
                    body: issue.body,
                    labels: issue.labels || [],
                  }),
                }
              );

              if (response.ok) {
                issuesCreated++;
              } else {
                const error = await response.json();
                results.errors.push(`Failed to create issue: ${error.message}`);
              }
            } catch (err) {
              results.errors.push(`Error creating issue: ${err instanceof Error ? err.message : 'Unknown'}`);
            }
          }
          
          results.github_issues_created = issuesCreated;
        }
      } catch (err) {
        results.errors.push(`GitHub integration error: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    // Apply to Portfolio (update Supabase)
    if (apply_to_portfolio && portfolio_updates) {
      try {
        const supabase = await createClient();
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          results.errors.push('User not authenticated');
        } else {
          // Update user profile with new skills
          if (portfolio_updates.skills_to_add?.length > 0) {
            for (const skill of portfolio_updates.skills_to_add) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase as any).from('user_skills').upsert({
                user_id: user.id,
                skill_name: skill.name,
                skill_category: skill.category,
                proficiency_level: skill.proficiency || 'intermediate',
                source: 'manual',
                is_verified: false,
              }, {
                onConflict: 'user_id,skill_name',
              });
            }
          }

          // Update portfolio data
          if (portfolio_updates.bio_suggestion || portfolio_updates.headline_suggestion) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: profile } = await (supabase as any)
              .from('user_profiles')
              .select('portfolio_data')
              .eq('user_id', user.id)
              .single();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const currentPortfolio: any = profile?.portfolio_data || {};
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('user_profiles').update({
              portfolio_data: {
                ...currentPortfolio,
                bio: portfolio_updates.bio_suggestion || currentPortfolio.bio,
                headline: portfolio_updates.headline_suggestion || currentPortfolio.headline,
                skills: [
                  ...(currentPortfolio.skills || []),
                  ...(portfolio_updates.skills_to_add || []),
                ],
              },
              last_synced_at: new Date().toISOString(),
            }).eq('user_id', user.id);
          }

          results.portfolio_updated = true;
        }
      } catch (err) {
        results.errors.push(`Portfolio update error: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    // Mark analysis as applied in database
    if (analysis_id) {
      try {
        const supabase = await createClient();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('analysis_results').update({
          is_applied: true,
          applied_at: new Date().toISOString(),
        }).eq('id', analysis_id);
      } catch (err) {
        console.error('Error marking analysis as applied:', err);
      }
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: results,
      processing_time_ms: processingTime,
    });
  } catch (error) {
    console.error('Apply updates error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
