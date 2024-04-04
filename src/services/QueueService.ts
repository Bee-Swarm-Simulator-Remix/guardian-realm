import Queue, { QueueOptions, StorableData } from "../framework/queues/Queue";
import QueueManager, { QueueClass } from "../framework/queues/QueueManager";
import { Name } from "../framework/services/Name";
import { Service } from "../framework/services/Service";
import { HasEventListeners } from "../types/HasEventListeners";

@Name("queueService")
class QueueService extends Service implements HasEventListeners {
    protected readonly queueManager = new QueueManager(this.application);

    public async onReady() {
        await this.sync();
    }

    public onBeforeQueueRegister() {
        this.queueManager.clearRegisteredQueues();
    }

    public register(queue: QueueClass, name?: string): void {
        this.queueManager.register(queue, name);
    }

    public async sync(): Promise<void> {
        const queues = await this.application.prisma.queue.findMany({
            where: {
                NOT: {
                    runsAt: null
                }
            }
        });

        for (const queueInfo of queues) {
            const {
                name,
                runsAt,
                channelId,
                createdAt,
                data,
                guildId,
                id,
                messageId,
                updatedAt,
                userId
            } = queueInfo;

            if (!runsAt) {
                continue;
            }

            const queue = this.queueManager.create(name, {
                data: data as StorableData,
                guildId,
                userId,
                channelId: channelId ?? undefined,
                messageId: messageId ?? undefined,
                runsAt,
                id,
                createdAt,
                updatedAt
            });

            if (runsAt.getTime() <= Date.now()) {
                queue.run().catch(this.application.logger.error);
                continue;
            }

            queue.setTimeout();
        }

        this.application.logger.info(`Synced ${queues.length} queued jobs`);
    }

    public create<T extends StorableData>(
        queue: string | QueueClass<T>,
        options: QueueOptions<NoInfer<T>>
    ): Queue<T> {
        return this.queueManager.create(queue, options);
    }
}

export default QueueService;