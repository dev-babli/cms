import { WorkflowDefinition, WorkflowAction, WorkflowStage, getAvailableActions, getWorkflowStage } from './definitions';

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  contentType: string;
  contentId: string;
  currentStage: string;
  history: WorkflowTransition[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkflowTransition {
  id: string;
  actionId: string;
  fromStage: string;
  toStage: string;
  userId: string;
  userName: string;
  userRole: string;
  comment?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface WorkflowExecutionResult {
  success: boolean;
  newStage?: string;
  transition?: WorkflowTransition;
  error?: string;
  notifications?: WorkflowNotificationResult[];
}

export interface WorkflowNotificationResult {
  type: 'email' | 'in_app' | 'webhook';
  success: boolean;
  recipient: string;
  error?: string;
}

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  // Register a workflow definition
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
  }

  // Get workflow definition
  getWorkflow(workflowId: string): WorkflowDefinition | null {
    return this.workflows.get(workflowId) || null;
  }

  // Create a new workflow instance
  createInstance(
    workflowId: string,
    contentType: string,
    contentId: string,
    userId: string,
    userName: string,
    userRole: string,
    metadata: Record<string, any> = {}
  ): WorkflowInstance {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const instanceId = `${contentType}_${contentId}`;
    const initialStage = workflow.stages.find(stage => 
      !workflow.actions.some(action => action.toStage === stage.id)
    );

    if (!initialStage) {
      throw new Error('No initial stage found in workflow');
    }

    const instance: WorkflowInstance = {
      id: instanceId,
      workflowId,
      contentType,
      contentId,
      currentStage: initialStage.id,
      history: [],
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
    };

    this.instances.set(instanceId, instance);
    return instance;
  }

  // Get workflow instance
  getInstance(contentType: string, contentId: string): WorkflowInstance | null {
    const instanceId = `${contentType}_${contentId}`;
    return this.instances.get(instanceId) || null;
  }

  // Execute a workflow action
  async executeAction(
    contentType: string,
    contentId: string,
    actionId: string,
    userId: string,
    userName: string,
    userRole: string,
    comment?: string,
    metadata: Record<string, any> = {}
  ): Promise<WorkflowExecutionResult> {
    const instance = this.getInstance(contentType, contentId);
    if (!instance) {
      return { success: false, error: 'Workflow instance not found' };
    }

    const workflow = this.getWorkflow(instance.workflowId);
    if (!workflow) {
      return { success: false, error: 'Workflow definition not found' };
    }

    const availableActions = getAvailableActions(workflow, instance.currentStage, userRole);
    const action = availableActions.find(a => a.id === actionId);

    if (!action) {
      return { success: false, error: 'Action not available or not permitted' };
    }

    // Check if comment is required
    if (action.requiresComment && !comment) {
      return { success: false, error: 'Comment is required for this action' };
    }

    // Create transition record
    const transition: WorkflowTransition = {
      id: `${instance.id}_${Date.now()}`,
      actionId,
      fromStage: instance.currentStage,
      toStage: action.toStage,
      userId,
      userName,
      userRole,
      comment,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // Update instance
    instance.currentStage = action.toStage;
    instance.history.push(transition);
    instance.updatedAt = new Date().toISOString();

    // Execute notifications
    const notifications = await this.executeNotifications(workflow, action.toStage, instance, transition);

    return {
      success: true,
      newStage: action.toStage,
      transition,
      notifications,
    };
  }

  // Get available actions for current stage
  getAvailableActions(contentType: string, contentId: string, userRole: string): WorkflowAction[] {
    const instance = this.getInstance(contentType, contentId);
    if (!instance) return [];

    const workflow = this.getWorkflow(instance.workflowId);
    if (!workflow) return [];

    return getAvailableActions(workflow, instance.currentStage, userRole);
  }

  // Get current stage information
  getCurrentStage(contentType: string, contentId: string): WorkflowStage | null {
    const instance = this.getInstance(contentType, contentId);
    if (!instance) return null;

    const workflow = this.getWorkflow(instance.workflowId);
    if (!workflow) return null;

    return getWorkflowStage(workflow, instance.currentStage);
  }

  // Get workflow history
  getWorkflowHistory(contentType: string, contentId: string): WorkflowTransition[] {
    const instance = this.getInstance(contentType, contentId);
    return instance ? instance.history : [];
  }

  // Check if user can perform action
  canPerformAction(
    contentType: string,
    contentId: string,
    actionId: string,
    userRole: string
  ): boolean {
    const availableActions = this.getAvailableActions(contentType, contentId, userRole);
    return availableActions.some(action => action.id === actionId);
  }

  // Get workflow status summary
  getWorkflowStatus(contentType: string, contentId: string): {
    currentStage: string;
    stageInfo: WorkflowStage | null;
    availableActions: WorkflowAction[];
    history: WorkflowTransition[];
    canEdit: boolean;
    isComplete: boolean;
  } | null {
    const instance = this.getInstance(contentType, contentId);
    if (!instance) return null;

    const workflow = this.getWorkflow(instance.workflowId);
    if (!workflow) return null;

    const stageInfo = getWorkflowStage(workflow, instance.currentStage);
    const availableActions = this.getAvailableActions(contentType, contentId, 'editor'); // Default role

    // Check if workflow is complete (no outgoing actions from current stage)
    const isComplete = !workflow.actions.some(action => action.fromStage === instance.currentStage);

    // Check if content can be edited (typically only in draft stage)
    const canEdit = instance.currentStage === 'draft';

    return {
      currentStage: instance.currentStage,
      stageInfo,
      availableActions,
      history: instance.history,
      canEdit,
      isComplete,
    };
  }

  // Execute notifications for stage transition
  private async executeNotifications(
    workflow: WorkflowDefinition,
    stageId: string,
    instance: WorkflowInstance,
    transition: WorkflowTransition
  ): Promise<WorkflowNotificationResult[]> {
    const stage = getWorkflowStage(workflow, stageId);
    if (!stage || !stage.notifications) return [];

    const results: WorkflowNotificationResult[] = [];

    for (const notification of stage.notifications) {
      try {
        const result = await this.sendNotification(notification, instance, transition);
        results.push(result);
      } catch (error) {
        results.push({
          type: notification.type,
          success: false,
          recipient: notification.recipients.join(','),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  // Send individual notification
  private async sendNotification(
    notification: any,
    instance: WorkflowInstance,
    transition: WorkflowTransition
  ): Promise<WorkflowNotificationResult> {
    // This would integrate with actual notification services
    // For now, we'll simulate the notification sending

    const template = this.renderNotificationTemplate(
      notification.template,
      instance,
      transition
    );

    switch (notification.type) {
      case 'email':
        // Integrate with email service (SendGrid, AWS SES, etc.)
        console.log(`Sending email to ${notification.recipients.join(', ')}:`, template);
        break;

      case 'in_app':
        // Store in-app notification in database
        console.log(`Creating in-app notification for ${notification.recipients.join(', ')}:`, template);
        break;

      case 'webhook':
        // Send webhook to external service
        console.log(`Sending webhook to ${notification.recipients.join(', ')}:`, template);
        break;
    }

    return {
      type: notification.type,
      success: true,
      recipient: notification.recipients.join(','),
    };
  }

  // Render notification template with variables
  private renderNotificationTemplate(
    template: string,
    instance: WorkflowInstance,
    transition: WorkflowTransition
  ): string {
    // Simple template rendering - in production, use a proper templating engine
    return template
      .replace(/\{\{title\}\}/g, instance.metadata.title || 'Untitled')
      .replace(/\{\{userName\}\}/g, transition.userName)
      .replace(/\{\{fromStage\}\}/g, transition.fromStage)
      .replace(/\{\{toStage\}\}/g, transition.toStage)
      .replace(/\{\{comment\}\}/g, transition.comment || '')
      .replace(/\{\{timestamp\}\}/g, new Date(transition.timestamp).toLocaleString());
  }

  // Bulk operations
  async bulkExecuteAction(
    contentType: string,
    contentIds: string[],
    actionId: string,
    userId: string,
    userName: string,
    userRole: string,
    comment?: string
  ): Promise<Array<{ contentId: string; result: WorkflowExecutionResult }>> {
    const results = [];

    for (const contentId of contentIds) {
      try {
        const result = await this.executeAction(
          contentType,
          contentId,
          actionId,
          userId,
          userName,
          userRole,
          comment
        );
        results.push({ contentId, result });
      } catch (error) {
        results.push({
          contentId,
          result: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    return results;
  }

  // Get workflow analytics
  getWorkflowAnalytics(workflowId: string, dateRange?: { from: Date; to: Date }): {
    totalInstances: number;
    stageDistribution: Record<string, number>;
    averageTimePerStage: Record<string, number>;
    completionRate: number;
  } {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      return {
        totalInstances: 0,
        stageDistribution: {},
        averageTimePerStage: {},
        completionRate: 0,
      };
    }

    const instances = Array.from(this.instances.values()).filter(
      instance => instance.workflowId === workflowId
    );

    if (dateRange) {
      const filtered = instances.filter(instance => {
        const createdAt = new Date(instance.createdAt);
        return createdAt >= dateRange.from && createdAt <= dateRange.to;
      });
    }

    const stageDistribution: Record<string, number> = {};
    const stageTimes: Record<string, number[]> = {};
    let completedInstances = 0;

    for (const instance of instances) {
      stageDistribution[instance.currentStage] = (stageDistribution[instance.currentStage] || 0) + 1;

      // Calculate stage times
      for (let i = 0; i < instance.history.length - 1; i++) {
        const current = instance.history[i];
        const next = instance.history[i + 1];
        
        const timeDiff = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime();
        const stageTime = timeDiff / (1000 * 60 * 60); // Convert to hours

        if (!stageTimes[current.toStage]) {
          stageTimes[current.toStage] = [];
        }
        stageTimes[current.toStage].push(stageTime);
      }

      // Check if completed
      const hasOutgoingActions = workflow.actions.some(action => action.fromStage === instance.currentStage);
      if (!hasOutgoingActions) {
        completedInstances++;
      }
    }

    const averageTimePerStage: Record<string, number> = {};
    for (const [stage, times] of Object.entries(stageTimes)) {
      averageTimePerStage[stage] = times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    return {
      totalInstances: instances.length,
      stageDistribution,
      averageTimePerStage,
      completionRate: instances.length > 0 ? completedInstances / instances.length : 0,
    };
  }
}

export const workflowEngine = WorkflowEngine.getInstance();



