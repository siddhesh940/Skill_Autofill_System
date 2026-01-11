import { NextRequest, NextResponse } from 'next/server';

// Create GitHub issues from generated tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repo_owner, repo_name, issues } = body;

    if (!repo_owner || !repo_name) {
      return NextResponse.json(
        { success: false, error: 'Repository owner and name are required' },
        { status: 400 }
      );
    }

    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Issues array is required' },
        { status: 400 }
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      return NextResponse.json(
        { success: false, error: 'GitHub token not configured on server' },
        { status: 500 }
      );
    }

    const results: {
      created_count: number;
      issue_urls: string[];
      errors: string[];
    } = {
      created_count: 0,
      issue_urls: [],
      errors: [],
    };

    // First, ensure labels exist in the repo
    const uniqueLabels = new Set<string>();
    issues.forEach((issue: { labels?: string[] }) => {
      issue.labels?.forEach(label => uniqueLabels.add(label));
    });

    for (const label of uniqueLabels) {
      try {
        await fetch(
          `https://api.github.com/repos/${repo_owner}/${repo_name}/labels`,
          {
            method: 'POST',
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: label,
              color: getLabelColor(label),
            }),
          }
        );
      } catch {
        // Label might already exist, ignore error
      }
    }

    // Create issues
    for (const issue of issues) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repo_owner}/${repo_name}/issues`,
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
          const data = await response.json();
          results.created_count++;
          results.issue_urls.push(data.html_url);
        } else {
          const error = await response.json();
          results.errors.push(`Failed to create "${issue.title}": ${error.message}`);
        }
      } catch (err) {
        results.errors.push(
          `Error creating "${issue.title}": ${err instanceof Error ? err.message : 'Unknown'}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('GitHub create issues error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getLabelColor(label: string): string {
  const colors: Record<string, string> = {
    'high-priority': 'd73a4a',
    'medium-priority': 'fbca04',
    'low-priority': '0e8a16',
    'feature': '0075ca',
    'enhancement': 'a2eeef',
    'learning': '7057ff',
    'skill-gap': 'e99695',
    'project': 'c5def5',
    'documentation': 'fef2c0',
  };
  
  return colors[label.toLowerCase()] || 'ededed';
}
