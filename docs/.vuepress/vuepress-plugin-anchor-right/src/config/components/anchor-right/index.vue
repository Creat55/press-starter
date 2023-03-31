<script setup>
import { ref, onMounted, inject } from "vue";
import { usePageData } from "@vuepress/client";
import SubMenu from "./sub-menu.vue";

const headers = ref([]);
const nowHeaders = ref([]);
const router = inject('router');
const route = inject('route');

const headerClick = (item) => {
	router.push(`#${item.slug}`);
	console.log(route.hash);
	changeHeaders()
};

onMounted(() => {
	const page = usePageData()
	headers.value = page.value.headers
	changeHeaders()
});

const changeHeaders = () => {
	nowHeaders.value = headers.value.filter((item) => item.link == route.hash)
	console.log(nowHeaders.value);
}
</script>

<template>
	<div class="anchor-right-content">
		<ul>
			<template v-for="(item, index) in headers" :key="index">
				<li @click="headerClick(item)" :class="['item', { active: route.hash === `#${item.slug}` }]">
					{{ item.title }}
					<template v-if="item.children.length > 0">
						<SubMenu :key="item.key" :menu-info="item" />
					</template>
				</li>
			</template>
		</ul>
	</div>
</template>
<style lang="scss">
@import "./style.scss";
</style>
