import { describe, expect, it } from 'vitest';

import type { ProjectManifest } from '../../../../../packages/platform-contracts/src/index.js';
import { findProject, visibleProjects } from './project-model';

const projects = [
  { schemaVersion: 1, id: 'visible', name: '可見項目', clients: [], homepage: { visible: true } },
  { schemaVersion: 1, id: 'hidden', name: '隱藏項目', clients: [], homepage: { visible: false } },
] as ProjectManifest[];

describe('React project access rules', () => {
  it('keeps hidden projects out of the homepage and discoverable by the route guard', () => {
    expect(visibleProjects(projects).map((project) => project.id)).toEqual(['visible']);
    expect(findProject(projects, 'hidden')?.homepage?.visible).toBe(false);
  });
});
