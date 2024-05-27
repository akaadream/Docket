import {defineStore, Store} from "pinia";
import {Ref, ref} from "vue";
import {Notification, NotificationType} from "../../utils/Notification.ts";
import {useProjectStore} from "./project.ts";
import {Project} from "../../utils/Project.ts";
import {slugify} from "../../utils/Slugify.ts";
import {TemplateMessage} from "../../utils/TemplateMessage.ts";

// Projects key
const PROJECTS_KEY = "projects";

// Server login form keys
const ADDRESS_KEY = "address";
const ROOM_KEY = "room";
const USERNAME_KEY = "username";
const SERVICE_KEY = "service";
const LAST_SELECTED_PROJECT_KEY = "current";

export const useGlobalStore = defineStore('global', () => {
    const projects: Ref<Project[]> = ref([]);
    const notifications: Ref<Notification[]> = ref([]);

    const storeProjects: Ref<Store[]> = ref([]);

    const defaultAddress = ref("ws://localhost:2567");
    const defaultRoom = ref("");
    const defaultService = ref("colyseus");
    const defaultUsername = ref("");

    /**
     * Add a new notification
     * @param content
     * @param type
     */
    function appendNotification(content: string, type: NotificationType) {
        notifications.value.push({
            content: content,
            type: type
        });
    }

    /**
     * Load the app data from the local storage
     */
    function load() {
        // Load projects
        const data = localStorage.getItem(PROJECTS_KEY);
        if (data) {
            projects.value = JSON.parse(data) as Project[];
        }

        // Load connection information
        const address = localStorage.getItem(ADDRESS_KEY);
        if (address) {
            defaultAddress.value = address;
            console.log("default address", address);
        }
        const room = localStorage.getItem(ROOM_KEY);
        if (room) {
            defaultRoom.value = room;
            console.log("default room", room);
        }
        const service = localStorage.getItem(SERVICE_KEY);
        if (service) {
            defaultService.value = service;
            console.log("default service", service);
        }
        const username = localStorage.getItem(USERNAME_KEY);
        if (username) {
            defaultUsername.value = username;
            console.log("default username", username);
        }

        const projectStore = useProjectStore();
        const currentlySelected = localStorage.getItem(LAST_SELECTED_PROJECT_KEY);
        if (currentlySelected) {
            const project = projects.value.find((project: Project) => project.name ? project.name === currentlySelected : false);
            if (project) {
                projectStore.hydrate(project.name, slugify(project.name), project.templates);
            }
        }

        appendNotification("Project loaded.", NotificationType.SUCCESS);
    }

    /**
     * Load the app data into the local storage
     */
    function save() {
        const projectStore = useProjectStore();

        localStorage.setItem(ADDRESS_KEY, defaultAddress.value);
        localStorage.setItem(ROOM_KEY, defaultRoom.value);
        localStorage.setItem(USERNAME_KEY, defaultUsername.value);
        localStorage.setItem(SERVICE_KEY, defaultService.value);
        localStorage.setItem(LAST_SELECTED_PROJECT_KEY, projectStore.name ?? "");

        const output = JSON.stringify(projects.value);
        if (output) {
            console.log("output", output);
            localStorage.setItem(PROJECTS_KEY, output);
        }

        appendNotification("Project saved.", NotificationType.SUCCESS);
    }

    function updateDefault(address: string, service: string, roomName: string, username: string) {
        defaultAddress.value = address;
        defaultService.value = service;
        defaultRoom.value = roomName;
        defaultUsername.value = username;
    }

    /**
     * Create a new project and automatically select it by default
     * @param projectName
     */
    function createProject(projectName: string) {
        const projectStore = useProjectStore();
        const project: Project = {
            name: projectName,
            templates: [],
        };
        projects.value.push(project);
        projectStore.hydrate(project.name, slugify(project.name), []);

        appendNotification("The project has been successfully created!", NotificationType.SUCCESS);

        save();
    }

    /**
     * Select another project
     * @param projectName
     */
    function selectProject(projectName: string) {
        const projectStore = useProjectStore();
        const nextProject = projects.value.find((project: Project) => project.name === projectName);
        if (nextProject) {
            projectStore.hydrate(nextProject.name, slugify(nextProject.name), nextProject.templates);
        }
    }

    /**
     * Add a message to a specific project data
     * (this function is called right after a message has been added to the currently opened project)
     * @param projectName
     * @param templateMessage
     */
    function addMessageTo(projectName: string, templateMessage: TemplateMessage) {
        for (const project of projects.value) {
            if (project.name === projectName) {
                project.templates.push(templateMessage);
            }
        }
    }

    /**
     * Delete an existing project
     * @param projectName
     */
    function deleteProject(projectName: string) {
        const projectStore = useProjectStore();
        const lengthBefore = projects.value.length;
        projects.value = projects.value.filter((project: Project) => project.name !== projectName);

        if (lengthBefore !== projects.value.length) {
            appendNotification("The project was successfully deleted.", NotificationType.SUCCESS);
        }
        else {
            appendNotification("Unexpected error. The project cannot be delete.", NotificationType.ERROR);
            return;
        }

        if (projectStore.name === projectName) {
            projectStore.$reset();
            if (projects.value.length > 0) {
                const project = projects.value[0];
                projectStore.hydrate(project.name, slugify(project.name), project.templates);
            }
        }

        save();
    }

    return {
        defaultAddress,
        defaultRoom,
        defaultService,
        defaultUsername,
        notifications,
        projects,
        storeProjects,

        addMessageTo,
        appendNotification,
        createProject,
        deleteProject,
        load,
        updateDefault,
        save,
        selectProject,
    };
})