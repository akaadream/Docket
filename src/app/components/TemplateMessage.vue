<script setup lang="ts">
import Icon from "./Icon.vue";
import {useGlobalStore} from "../storages/global.ts";
import {TemplateMessageType} from "../../utils/TemplateMessage.ts";
import ConfirmModal from "../modals/ConfirmModal.vue";
import {useModalsStore} from "../storages/modals.ts";

const globalStore = useGlobalStore();
const modalsStore = useModalsStore();
const currentProject = globalStore.currentProject;

export interface TemplateMessageProps {
    identifier: number;
    name: string;
    args: string;
    type: TemplateMessageType;
}

const props = defineProps<TemplateMessageProps>();

function test() {
    if (props.type === TemplateMessageType.REQUEST) {
        currentProject?.client?.request(props.name, props.args);
    }
    else {
        currentProject?.client?.message(props.name);
    }
}

function edit() {
    // TODO: display edit modal with this message as default values
    // don't forget

}

function remove() {
    modalsStore.open(`message-template-${props.identifier}`);
    // if (confirm("Do you really want to delete this message?")) {
    //     globalStore.currentProject?.tryDelete(props.name);
    //     // TODO: push notification
    // }
}
</script>

<template>
    <ConfirmModal :id="`message-template-${props.identifier}`" :message-name="props.name" />

    <div :id="props.identifier" class="message-template">
        <div class="message-template-infos">
            <div class="message-template-name tag is-medium is-link">
                {{ props.name }}
            </div>
        </div>

        <div class="buttons has-addons">
            <button @click.prevent.stop="test" class="button is-dark">
                <Icon name="play_arrow" aria-hidden="true" />
            </button>

            <button @click.prevent.stop="edit" class="button is-dark modal-opening-button" data-target="edit-message-modal">
                <Icon name="edit" aria-hidden="true" />
            </button>

            <button @click.prevent.stop="remove" class="button is-danger is-dark">
                <Icon name="delete" aria-hidden="true" />
            </button>
        </div>
    </div>
</template>