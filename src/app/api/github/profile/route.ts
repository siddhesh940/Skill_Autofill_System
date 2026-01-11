import { NextRequest, NextResponse } from 'next/server';

// Fetch public GitHub profile data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { success: false, error: 'Invalid GitHub username format' },
        { status: 400 }
      );
    }

    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        }),
      },
    });

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: 'GitHub user not found' },
          { status: 404 }
        );
      }
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    // Fetch repos
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=50&sort=pushed`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN && {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          }),
        },
      }
    );

    const reposData = reposResponse.ok ? await reposResponse.json() : [];

    // Aggregate languages
    const languages: Record<string, number> = {};
    const topics: Set<string> = new Set();

    for (const repo of reposData) {
      if (repo.fork) continue;

      // Count primary language
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }

      // Collect topics
      if (repo.topics) {
        repo.topics.forEach((topic: string) => topics.add(topic));
      }
    }

    // Sort languages by frequency
    const sortedLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({ language: lang, repoCount: count }));

    return NextResponse.json({
      success: true,
      data: {
        user: {
          login: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          html_url: userData.html_url,
          bio: userData.bio,
          public_repos: userData.public_repos,
          followers: userData.followers,
        },
        languages: sortedLanguages,
        topics: Array.from(topics).slice(0, 30),
        recent_repos: reposData
          .filter((r: { fork: boolean }) => !r.fork)
          .slice(0, 10)
          .map((r: { 
            name: string;
            description: string;
            html_url: string;
            language: string;
            stargazers_count: number;
            topics: string[];
          }) => ({
            name: r.name,
            description: r.description,
            url: r.html_url,
            language: r.language,
            stars: r.stargazers_count,
            topics: r.topics,
          })),
      },
    });
  } catch (error) {
    console.error('GitHub profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
