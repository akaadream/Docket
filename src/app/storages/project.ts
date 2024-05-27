import {defineStore} from "pinia";
import {DocSocketClient} from "../../clients/DocSocketClient.ts";
import {ref, Ref} from "vue";
import {TemplateMessage, TemplateMessageType} from "../../utils/TemplateMessage.ts";
import {Message, MessageType} from "../../utils/Message.ts";
import {ColyseusClient} from "../../clients/ColyseusClient.ts";
import {SocketIOClient} from "../../clients/SocketIOClient.ts";
import {WebSocketClient} from "../../clients/WebSocketClient.ts";
import {toMarkdown} from "../../utils/Export.ts";
import {useGlobalStore} from "./global.ts";

/**
 * Define the project store
 * This store represent the current selected project
 */
export const useProjectStore = defineStore('project', () => {
    const name: Ref<string> = ref("");
    const slug: Ref<string> = ref("");
    const client: Ref<DocSocketClient|null> = ref(null);
    const templates: Ref<TemplateMessage[]> = ref([]);
    const messages: Ref<Message[]> = ref([]);
    const selectedMessage: Ref<TemplateMessage|undefined> = ref(undefined);

    /**
     * If a project can be considered as selected
     */
    function selected(): boolean {
        return name.value !== "" && slug.value !== "";
    }

    /**
     * Connect the user to the right service
     * @param service
     * @param address
     * @param roomName
     * @param username
     */
    function connect(service: string, address: string, roomName: string, username: string) {
        switch (service) {
            case 'colyseus':
                client.value = new ColyseusClient(address, roomName, username);
                break;
            case 'socketio':
                client.value = new SocketIOClient(address, username);
                break;
            case 'websocket':
                client.value = new WebSocketClient(address, username);
                break;
        }
    }

    /**
     * Return true if the client is currently connected
     */
    function connected(): boolean {
        return client.value?.connected ?? false;
    }

    /**
     * Disconnect the user from the service
     */
    function disconnect() {
        client.value?.disconnect();
    }

    /**
     * Hydrate the project store with initial values
     * @param newName
     * @param newSlug
     * @param newTemplates
     */
    function hydrate(newName: string, newSlug: string, newTemplates: TemplateMessage[]) {
        name.value = newName;
        slug.value = newSlug;

        if (newTemplates) {
            for (let i = 0; i < newTemplates.length; i++) {
                const message = newTemplates[i];
                templates.value.push({
                    id: message.id,
                    name: message.name,
                    args: message.args,
                    type: message.type
                });
            }
        }
    }

    /**
     * Listen messages
     */
    function listen() {
        for (const message of templates.value) {
            listenOne(message);
        }
    }

    /**
     * Listen one single message
     * @param message
     */
    function listenOne(message: TemplateMessage) {
        if (message.type === TemplateMessageType.RESPONSE) {
            client.value?.message(message.name);
        }
    }

    /**
     * Get the documentation string generated by the template messages
     */
    function documentation(): string {
        let md = ``;
        for (const message of templates.value) {
            md += toMarkdown(message);
        }

        return md;
    }

    /**
     * Add a new template message inside the project
     * @param messageName
     * @param args
     * @param type
     */
    function addTemplate(messageName: string, args: string, type: TemplateMessageType) {
        const globalStore = useGlobalStore();
        const message: TemplateMessage = {
            id: templates.value.length,
                name: messageName,
                args: args,
                type: type
        };
        templates.value.push(message);
        globalStore.addMessageTo(name.value, message);

        if (type === TemplateMessageType.RESPONSE) {
            listenOne(message);
        }

        globalStore.save();

        return message;
    }

    /**
     * Delete the template message corresponding to the given name and return true if it succeeds and false otherwise
     * @param name
     */
    function deleteTemplate(name: string): boolean {
        for (let i = templates.value.length - 1; i >= 0; i--) {
            const message = templates.value[i];
            if (message && message.name === name) {
                templates.value.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * Clear all the output messages
     */
    function clearMessages() {
        messages.value = [];
    }

    /**
     * Define a new client on the project
     * @param newClient
     */
    function setClient(newClient: DocSocketClient) {
        client.value = newClient;
    }

    /**
     * Add a new message inside the project
     * @param name
     * @param content
     * @param type
     */
    function addMessage(name: string, content: string, type: MessageType) {
        messages.value.push({
            name: name,
            content: content,
            type: type
        });
    }

    /**
     * Get the json representation of the project
     */
    function toJson() {
        return {
            'name': name,
            'slug': slug,
            'messages': templates.value,
            'client': client.value?.toJson()
        }
    }

    /**
     * Remap template messages ID (maybe not necessary since we use VueJS)
     */
    function remap() {
        for (let i = 0; i < templates.value.length; i++) {
            const message = templates.value[i];
            if (message) {
                message.id = i;
            }
        }
    }

    return {
        name,
        slug,
        client,
        messages,
        selectedMessage,
        templates,

        addMessage,
        addTemplate,
        clearMessages,
        connect,
        connected,
        deleteTemplate,
        disconnect,
        documentation,
        hydrate,
        listen,
        listenOne,
        remap,
        selected,
        setClient,
        toJson,
    }
});