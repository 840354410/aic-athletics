<template>
  <scroll-view class="team-list" :scroll-y="true" @scrolltolower="scrolltolower">
    <view class="au-container flex px-40rpx py-24rpx">
      <view class="flex-none icon-100">
        <AuUpload
          v-model="userInfo.avatar"
          :maxCount="1"
          width="100rpx"
          height="100rpx"
          uploadAlign="right"
          shape="circle"
          :replaceable="true"
        >
          <image
            class="icon-32 rounded-1/2 absolute right-0 bottom-0"
            src="@/assets/images/icon-edit-primary.png"
            mode="apectFill"
          />
        </AuUpload>
      </view>
      <view class="flex-1 flex-y-center ml-54rpx min-w-0">
        <view class="u-main-color text-28rpx h-lh-38rpx text-over flex-none">{{ userInfo.userName }}</view>
        <view class="u-tips-color text-28rpx h-lh-38rpx ml-38rpx text-over flex-1 min-w-0">
          {{ userInfo.phone }}
        </view>
        <i class="iconfont icon-tuichu text-40rpx u-tips-color flex-none ml-16rpx" @click="clickLoginOut"></i>
      </view>
    </view>
    <view class="mx-24rpx my-24rpx">
      <AuBreadCrumb>我创建的队伍</AuBreadCrumb>
    </view>
    <view class="overflow-hidden" v-if="list.length">
      <view
        class="au-container flex px-40rpx pt-40rpx pb-40rpx mb-40rpx"
        v-for="(item, index) in list"
        :key="index"
        @click="clickTeamItem(item)"
      >
        <view class="flex-none flex-xy-center items-center w-100rpx">
          <image class="icon-100 rounded-1/2" :src="item.teamLogo || aicLogoUrl" mode="aspectFill" />
        </view>
        <view class="flex-1 ml-24rpx min-w-0">
          <view class="u-main-color text-28rpx h-lh-38rpx text-over">{{ item.teamName }}</view>
          <view class="u-tips-color text-28rpx h-lh-38rpx mt-16rpx text-over">创建人：{{ item.leaderName }}</view>
        </view>
      </view>
    </view>
    <view class="pt-256rpx" v-else>
      <u-empty mode="data" :icon="listDefault1" text="暂无数据" width="473rpx" height="368rpx" textColor="#2d2d2d"></u-empty>
    </view>
  </scroll-view>
  <AuFixed>
    <AuButtonGroup confirmText="创建队伍" confirmIcon="plus" @click="clickButtonGroup"></AuButtonGroup>
  </AuFixed>
</template>

<script lang="ts" setup>
import AuBreadCrumb from '@/components/AuBreadCrumb/AuBreadCrumb.vue';
import { requestTasks, deepClone } from '@/utils/index';
import { listDefault1, headImg, aicLogoUrl } from '@/athletics/config/images';
import { SportTeamListRes } from '@/athletics/model/sport';
import { sportMyTeamListApi } from '@/athletics/api/sport';
import { UserInfoRes } from '@/model/common';
import { uploadAvatarApi } from '@/api/common';
import { useAuthStore } from '@/store/auth';
const authStore = useAuthStore();

const props = withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  {
    show: false
  }
);

async function requestAll(key: string, ...args: any[]) {
  requestTasks.start();
  let res;
  if (key == 'onLoad') {
    requestTasks.add(sportTeamListFn());
  } else if (key == 'onShow') {
    queryParams.pageNo = 1;
    requestTasks.add(sportTeamListFn());
  } else if (key == 'onReachBottom') {
    requestTasks.add(sportTeamListFn());
  } else if (key == 'uploadAvatar') {
    requestTasks.add(uploadAvatarFn());
  }
  requestTasks.end();
  return res;
}

async function sportTeamListFn() {
  const params = Object.assign({}, queryParams);
  const task = sportMyTeamListApi(params);
  task.then((res) => {
    let bizData = res?.bizData;
    if (!bizData) {
      return;
    }
    if (queryParams.pageNo == 1) {
      list.length = 0;
    }
    if (bizData?.length) {
      queryParams.pageNo++;
    }
    list.push(...bizData);
  });
  return task;
}

async function uploadAvatarFn() {
  if (!authStore.userInfo || !userInfo.avatar) {
    return;
  }
  const task = uploadAvatarApi(userInfo.avatar);
  task.then(async (res) => {
    if (!res.success) {
      return;
    }
    if (authStore.userInfo) {
      authStore.userInfo.avatar = userInfo.avatar as string;
    }
  });
  return task;
}

const userInfo: Partial<UserInfoRes> = reactive(deepClone(authStore.userInfo || {}));
userInfo.avatar = userInfo.avatar || headImg;
watch(
  () => userInfo.avatar,
  (newVal, oldVal) => {
    if (newVal && newVal.slice(0, 4) == 'http') {
      console.log('更改用户头像');
      requestAll('uploadAvatar');
    }
  }
);
const list = reactive<SportTeamListRes[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20
});
function scrolltolower() {
  requestAll('onReachBottom');
}
function clickTeamItem(item) {
  const { teamId } = item;
  uni.navigateTo({
    url: `/athletics/pages/CreateTeamTemp/CreateTeamTemp?teamId=${teamId}`
  });
}
function clickButtonGroup() {
  uni.navigateTo({
    url: '/athletics/pages/CreateTeamTemp/CreateTeamTemp'
  });
}
function clickLoginOut() {
  uni.showModal({
    title: '提示',
    content: '确定退出？',
    success: ({ confirm }) => {
      if (confirm) {
        authStore.logout();
      }
    }
  });
}

let firstLoad = true;
onLoad(() => {
  requestAll('onLoad');
  setTimeout(() => {
    firstLoad = false;
  });
});
onShow(() => {
  if (!firstLoad) {
    setTimeout(() => {
      requestAll('onShow');
    }, 500);
  }
});
onReachBottom(() => {
  if (!props.show || queryParams.pageNo == 1) {
    return;
  }
  requestAll('onReachBottom');
});
</script>

<style scoped lang="scss">
.tag {
  height: 44rpx;
  line-height: 44rpx;
  border-radius: 0rpx 16rpx 16rpx 16rpx;
  padding: 0 16rpx 0 8rpx;
  color: #fff;
  font-size: 28rpx;
  width: fit-content;
  margin-top: 18rpx;
  &.tag--1 {
    background-color: #abb6c2;
  }
  &.tag--2 {
    background-color: $u-primary;
  }
  &.tag--3 {
    background-color: #a8a8a8;
  }
}
.team-list {
  height: calc(100vh - 326rpx);
}
</style>
