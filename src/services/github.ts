// GitHub API Service (Public endpoints only - no auth required)

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubLanguages {
  [language: string]: number;
}

const GITHUB_API = 'https://api.github.com';

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // ms between requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  
  return fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
  });
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  try {
    const response = await rateLimitedFetch(`${GITHUB_API}/users/${username}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`GitHub user not found: ${username}`);
        return null;
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    return null;
  }
}

export async function fetchUserRepos(
  username: string, 
  options: { per_page?: number; sort?: 'updated' | 'pushed' | 'created' } = {}
): Promise<GitHubRepo[]> {
  try {
    const { per_page = 30, sort = 'updated' } = options;
    const response = await rateLimitedFetch(
      `${GITHUB_API}/users/${username}/repos?per_page=${per_page}&sort=${sort}`
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
}

export async function fetchRepoLanguages(
  owner: string, 
  repo: string
): Promise<GitHubLanguages> {
  try {
    const response = await rateLimitedFetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`);
    
    if (!response.ok) {
      return {};
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching repo languages:', error);
    return {};
  }
}

export async function fetchUserLanguages(username: string): Promise<Map<string, number>> {
  const repos = await fetchUserRepos(username, { per_page: 50 });
  const languageBytes = new Map<string, number>();
  
  // Aggregate languages from all repos
  for (const repo of repos) {
    if (repo.fork) continue; // Skip forked repos
    
    const languages = await fetchRepoLanguages(username, repo.name);
    
    for (const [lang, bytes] of Object.entries(languages)) {
      languageBytes.set(lang, (languageBytes.get(lang) || 0) + bytes);
    }
  }
  
  return languageBytes;
}

export interface GitHubProfile {
  user: GitHubUser;
  repos: GitHubRepo[];
  languages: Map<string, number>;
  topLanguages: string[];
  skills: string[];
}

export async function fetchCompleteGitHubProfile(username: string): Promise<GitHubProfile | null> {
  const user = await fetchGitHubUser(username);
  if (!user) return null;
  
  const repos = await fetchUserRepos(username, { per_page: 50, sort: 'pushed' });
  const languages = await fetchUserLanguages(username);
  
  // Sort languages by bytes
  const sortedLanguages = [...languages.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang);
  
  // Extract skills from repos (topics, languages, etc.)
  const skills = new Set<string>();
  
  // Add languages
  sortedLanguages.slice(0, 10).forEach(lang => skills.add(lang));
  
  // Add topics from repos
  repos.forEach(repo => {
    repo.topics?.forEach(topic => {
      // Normalize topic names
      const normalized = topic.replace(/-/g, ' ').replace(/js$/, 'JavaScript');
      skills.add(normalized);
    });
  });
  
  return {
    user,
    repos: repos.filter(r => !r.fork), // Only non-forked repos
    languages,
    topLanguages: sortedLanguages.slice(0, 10),
    skills: Array.from(skills).slice(0, 30),
  };
}

// Format bytes to percentage for display
export function calculateLanguagePercentages(
  languages: Map<string, number>
): Array<{ language: string; percentage: number; bytes: number }> {
  const total = [...languages.values()].reduce((a, b) => a + b, 0);
  
  return [...languages.entries()]
    .map(([language, bytes]) => ({
      language,
      bytes,
      percentage: Math.round((bytes / total) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}
