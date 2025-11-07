export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  roles: string[]; // Roles allowed to transition to this stage
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
  notifications?: WorkflowNotification[];
}

export interface WorkflowAction {
  id: string;
  name: string;
  type: 'approve' | 'reject' | 'request_changes' | 'publish' | 'archive' | 'custom';
  fromStage: string;
  toStage: string;
  roles: string[]; // Roles allowed to perform this action
  requiresComment?: boolean;
  autoExecute?: boolean;
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowNotification {
  type: 'email' | 'in_app' | 'webhook';
  trigger: 'on_enter' | 'on_leave' | 'on_action';
  recipients: string[]; // User IDs or roles
  template: string;
  subject?: string;
  conditions?: WorkflowCondition[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  contentType: string; // 'blog_post', 'service', 'page', etc.
  stages: WorkflowStage[];
  actions: WorkflowAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Predefined workflow templates
export const WORKFLOW_TEMPLATES: Record<string, Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>> = {
  // Simple blog workflow
  simple_blog: {
    name: 'Simple Blog Workflow',
    description: 'Basic workflow for blog posts: Draft → Published',
    contentType: 'blog_post',
    isActive: true,
    stages: [
      {
        id: 'draft',
        name: 'Draft',
        description: 'Work in progress',
        color: '#6B7280',
        icon: 'edit',
        roles: ['author', 'editor', 'admin'],
        actions: [],
        notifications: []
      },
      {
        id: 'published',
        name: 'Published',
        description: 'Live on the website',
        color: '#10B981',
        icon: 'check-circle',
        roles: ['editor', 'admin'],
        actions: [],
        notifications: [
          {
            type: 'webhook',
            trigger: 'on_enter',
            recipients: ['all'],
            template: 'blog_post_published',
            conditions: []
          }
        ]
      }
    ],
    actions: [
      {
        id: 'publish',
        name: 'Publish',
        type: 'publish',
        fromStage: 'draft',
        toStage: 'published',
        roles: ['author', 'editor', 'admin'],
        requiresComment: false
      },
      {
        id: 'unpublish',
        name: 'Unpublish',
        type: 'custom',
        fromStage: 'published',
        toStage: 'draft',
        roles: ['editor', 'admin'],
        requiresComment: true
      }
    ]
  },

  // Editorial workflow
  editorial: {
    name: 'Editorial Workflow',
    description: 'Full editorial process with review stages',
    contentType: 'blog_post',
    isActive: true,
    stages: [
      {
        id: 'draft',
        name: 'Draft',
        description: 'Author is working on content',
        color: '#6B7280',
        icon: 'edit',
        roles: ['author', 'editor', 'admin'],
        actions: [],
        notifications: []
      },
      {
        id: 'pending_review',
        name: 'Pending Review',
        description: 'Waiting for editorial review',
        color: '#F59E0B',
        icon: 'clock',
        roles: ['editor', 'admin'],
        actions: [],
        notifications: [
          {
            type: 'email',
            trigger: 'on_enter',
            recipients: ['editor'],
            template: 'content_pending_review',
            subject: 'Content Pending Review: {{title}}'
          }
        ]
      },
      {
        id: 'approved',
        name: 'Approved',
        description: 'Editor has approved the content',
        color: '#3B82F6',
        icon: 'check',
        roles: ['editor', 'admin'],
        actions: [],
        notifications: [
          {
            type: 'email',
            trigger: 'on_enter',
            recipients: ['author'],
            template: 'content_approved',
            subject: 'Content Approved: {{title}}'
          }
        ]
      },
      {
        id: 'published',
        name: 'Published',
        description: 'Live on the website',
        color: '#10B981',
        icon: 'check-circle',
        roles: ['editor', 'admin'],
        actions: [],
        notifications: [
          {
            type: 'webhook',
            trigger: 'on_enter',
            recipients: ['all'],
            template: 'content_published',
            conditions: []
          }
        ]
      },
      {
        id: 'rejected',
        name: 'Rejected',
        description: 'Content needs revision',
        color: '#EF4444',
        icon: 'x-circle',
        roles: ['author', 'editor', 'admin'],
        actions: [],
        notifications: [
          {
            type: 'email',
            trigger: 'on_enter',
            recipients: ['author'],
            template: 'content_rejected',
            subject: 'Content Needs Revision: {{title}}'
          }
        ]
      }
    ],
    actions: [
      {
        id: 'submit_for_review',
        name: 'Submit for Review',
        type: 'custom',
        fromStage: 'draft',
        toStage: 'pending_review',
        roles: ['author', 'editor', 'admin'],
        requiresComment: false
      },
      {
        id: 'approve',
        name: 'Approve',
        type: 'approve',
        fromStage: 'pending_review',
        toStage: 'approved',
        roles: ['editor', 'admin'],
        requiresComment: false
      },
      {
        id: 'publish',
        name: 'Publish',
        type: 'publish',
        fromStage: 'approved',
        toStage: 'published',
        roles: ['editor', 'admin'],
        requiresComment: false
      },
      {
        id: 'reject',
        name: 'Request Changes',
        type: 'reject',
        fromStage: 'pending_review',
        toStage: 'rejected',
        roles: ['editor', 'admin'],
        requiresComment: true
      },
      {
        id: 'revise',
        name: 'Revise',
        type: 'custom',
        fromStage: 'rejected',
        toStage: 'draft',
        roles: ['author', 'editor', 'admin'],
        requiresComment: false
      }
    ]
  },

  // Enterprise workflow with multiple approval stages
  enterprise: {
    name: 'Enterprise Workflow',
    description: 'Multi-stage approval process for enterprise content',
    contentType: 'blog_post',
    isActive: true,
    stages: [
      {
        id: 'draft',
        name: 'Draft',
        description: 'Initial content creation',
        color: '#6B7280',
        icon: 'edit',
        roles: ['author', 'editor', 'admin'],
        actions: [],
        notifications: []
      },
      {
        id: 'content_review',
        name: 'Content Review',
        description: 'Editorial review for content quality',
        color: '#F59E0B',
        icon: 'eye',
        roles: ['editor', 'admin'],
        actions: [],
        notifications: [
          {
            type: 'email',
            trigger: 'on_enter',
            recipients: ['editor'],
            template: 'content_review_needed',
            subject: 'Content Review Required: {{title}}'
          }
        ]
      },
      {
        id: 'legal_review',
        name: 'Legal Review',
        description: 'Legal compliance check',
        color: '#8B5CF6',
        icon: 'scale',
        roles: ['legal', 'admin'],
        actions: [],
        notifications: [
          {
            type: 'email',
            trigger: 'on_enter',
            recipients: ['legal'],
            template: 'legal_review_needed',
            subject: 'Legal Review Required: {{title}}'
          }
        ]
      },
      {
        id: 'final_approval',
        name: 'Final Approval',
        description: 'Final approval from management',
        color: '#3B82F6',
        icon: 'check-circle-2',
        roles: ['admin', 'manager'],
        actions: [],
        notifications: [
          {
            type: 'email',
            trigger: 'on_enter',
            recipients: ['admin', 'manager'],
            template: 'final_approval_needed',
            subject: 'Final Approval Required: {{title}}'
          }
        ]
      },
      {
        id: 'published',
        name: 'Published',
        description: 'Live on the website',
        color: '#10B981',
        icon: 'check-circle',
        roles: ['admin'],
        actions: [],
        notifications: [
          {
            type: 'webhook',
            trigger: 'on_enter',
            recipients: ['all'],
            template: 'content_published',
            conditions: []
          }
        ]
      },
      {
        id: 'archived',
        name: 'Archived',
        description: 'Content has been archived',
        color: '#9CA3AF',
        icon: 'archive',
        roles: ['admin'],
        actions: [],
        notifications: []
      }
    ],
    actions: [
      {
        id: 'submit_content_review',
        name: 'Submit for Content Review',
        type: 'custom',
        fromStage: 'draft',
        toStage: 'content_review',
        roles: ['author', 'editor', 'admin'],
        requiresComment: false
      },
      {
        id: 'content_approved',
        name: 'Content Approved',
        type: 'approve',
        fromStage: 'content_review',
        toStage: 'legal_review',
        roles: ['editor', 'admin'],
        requiresComment: false
      },
      {
        id: 'legal_approved',
        name: 'Legal Approved',
        type: 'approve',
        fromStage: 'legal_review',
        toStage: 'final_approval',
        roles: ['legal', 'admin'],
        requiresComment: false
      },
      {
        id: 'final_approved',
        name: 'Final Approval',
        type: 'approve',
        fromStage: 'final_approval',
        toStage: 'published',
        roles: ['admin', 'manager'],
        requiresComment: false
      },
      {
        id: 'archive',
        name: 'Archive',
        type: 'archive',
        fromStage: 'published',
        toStage: 'archived',
        roles: ['admin'],
        requiresComment: true
      }
    ]
  },

  // Service page workflow
  service_workflow: {
    name: 'Service Page Workflow',
    description: 'Workflow for service pages and product descriptions',
    contentType: 'service',
    isActive: true,
    stages: [
      {
        id: 'draft',
        name: 'Draft',
        description: 'Service information being prepared',
        color: '#6B7280',
        icon: 'edit',
        roles: ['author', 'editor', 'admin'],
        actions: [],
        notifications: []
      },
      {
        id: 'review',
        name: 'Review',
        description: 'Reviewing service details and pricing',
        color: '#F59E0B',
        icon: 'eye',
        roles: ['editor', 'admin'],
        actions: [],
        notifications: [
          {
            type: 'email',
            trigger: 'on_enter',
            recipients: ['editor'],
            template: 'service_review_needed',
            subject: 'Service Review Required: {{title}}'
          }
        ]
      },
      {
        id: 'published',
        name: 'Published',
        description: 'Service is live and visible',
        color: '#10B981',
        icon: 'check-circle',
        roles: ['editor', 'admin'],
        actions: [],
        notifications: [
          {
            type: 'webhook',
            trigger: 'on_enter',
            recipients: ['all'],
            template: 'service_published',
            conditions: []
          }
        ]
      }
    ],
    actions: [
      {
        id: 'submit_review',
        name: 'Submit for Review',
        type: 'custom',
        fromStage: 'draft',
        toStage: 'review',
        roles: ['author', 'editor', 'admin'],
        requiresComment: false
      },
      {
        id: 'approve_service',
        name: 'Approve Service',
        type: 'approve',
        fromStage: 'review',
        toStage: 'published',
        roles: ['editor', 'admin'],
        requiresComment: false
      }
    ]
  }
};

// Helper functions for workflow management
export function getWorkflowTemplate(templateId: string): WorkflowDefinition | null {
  const template = WORKFLOW_TEMPLATES[templateId];
  if (!template) return null;

  return {
    ...template,
    id: `template_${templateId}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  };
}

export function getAllWorkflowTemplates(): WorkflowDefinition[] {
  return Object.keys(WORKFLOW_TEMPLATES).map(templateId => 
    getWorkflowTemplate(templateId)!
  );
}

export function getWorkflowForContentType(contentType: string): WorkflowDefinition[] {
  return getAllWorkflowTemplates().filter(workflow => 
    workflow.contentType === contentType
  );
}

export function getAvailableActions(
  workflow: WorkflowDefinition,
  currentStage: string,
  userRole: string
): WorkflowAction[] {
  return workflow.actions.filter(action => 
    action.fromStage === currentStage && 
    action.roles.includes(userRole)
  );
}

export function canTransitionToStage(
  workflow: WorkflowDefinition,
  stageId: string,
  userRole: string
): boolean {
  const stage = workflow.stages.find(s => s.id === stageId);
  return stage ? stage.roles.includes(userRole) : false;
}

export function getWorkflowStage(workflow: WorkflowDefinition, stageId: string): WorkflowStage | null {
  return workflow.stages.find(stage => stage.id === stageId) || null;
}

export function getInitialStage(workflow: WorkflowDefinition): WorkflowStage | null {
  // Find the stage with no incoming actions (typically 'draft')
  const stagesWithIncomingActions = new Set(
    workflow.actions.map(action => action.toStage)
  );
  
  return workflow.stages.find(stage => 
    !stagesWithIncomingActions.has(stage.id)
  ) || null;
}



