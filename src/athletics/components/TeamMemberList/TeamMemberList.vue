<template>
  <AuPopup
    v-model:show="show"
    mode="bottom"
    round="40rpx"
    :customStyle="{
      backgroundColor: 'transparent'
    }"
    v-if="signupData"
  >
    <view class="text-28rpx">
      <view class="text-right mb-20rpx mr-40rpx" @click="close">
        <i class="iconfont icon-close color-white text-50rpx"></i>
      </view>
      <view class="bg-white rounded-t-40rpx max-h-80vh overflow-auto">
        <view class="flex-y-center p-40rpx border-b-2">
          <image class="icon-64 rounded-1/2" :src="signupData.eventTeamLogo || aicLogoUrl" mode="aspectFill" />
          <text class="color-hex-3C4380 font-bold mx-20rpx">{{ signupData.eventTeamName }}</text>
          <text class="ml-auto u-tips-color">共{{ signupData.teamMemberList?.length || 0 }}人</text>
        </view>
        <view class="p-40rpx">
          <view>
            <view class="flex-y-center justify-between mb-24rpx">
              <text class="u-main-color font-bold">队伍管理人员</text>
              <text class="u-tips-color">共{{ signupData.teamWorkerList?.length || 0 }}人</text>
            </view>
            <view>
              <view class="flex-y-center py-32rpx" v-for="(item, index) in signupData.teamWorkerList" :key="index">
                <image class="icon-112" :src="item.memberAvatar" mode="aspectFill" v-if="item.memberAvatar" />
                <up-avatar size="112rpx"></up-avatar>
                <view class="flex-1 min-w-0 ml-40rpx">
                  <view>{{ item.memberName }}</view>
                </view>
                <view
                  class="ml-auto bg-cover-auto w-88rpx h-77rpx flex-x-center items-end"
                  :style="{
                    backgroundImage: `url(${ballUniformBgUrl})`
                  }"
                >
                  <view class="mb-16rpx u-primary">{{ item.roleName }}</view>
                </view>
              </view>
            </view>
          </view>
          <view>
            <view class="flex-y-center justify-between mb-24rpx">
              <text class="u-main-color font-bold">队伍人员</text>
            </view>
            <view class="team-member-list" v-if="signupData?.teamMemberList?.length">
              <view
                class="flex-y-center team-member-list__item py-32rpx"
                v-for="(item, index) in signupData.teamMemberList"
                :key="index"
              >
                <image class="icon-112" :src="item.memberAvatar" mode="aspectFill" v-if="item.memberAvatar" />
                <up-avatar size="112rpx"></up-avatar>
                <view class="flex-1 min-w-0 ml-40rpx">
                  <view>{{ item.memberName }}</view>
                  <view class="mt-4rpx" :class="auditStatusMap[item.auditStatus || '']?.className">
                    {{ auditStatusMap[item.auditStatus || '']?.text }}
                  </view>
                </view>
                <view
                  class="ml-auto bg-cover-auto w-88rpx h-77rpx flex-x-center items-end"
                  :style="{
                    backgroundImage: `url(${ballUniformBgUrl})`
                  }"
                  v-if="item.userMemberNo"
                >
                  <view class="mb-16rpx u-primary">{{ item.userMemberNo }}</view>
                </view>
              </view>
            </view>
            <view class="my-48rpx" v-else>
              <u-empty
                mode="data"
                :icon="peopleDefault"
                text="您的队伍还没有成员喔，赶紧去招募您的团员吧！"
                width="400rpx"
                height="307rpx"
              ></u-empty>
            </view>
          </view>
        </view>
      </view>
    </view>
  </AuPopup>
</template>

<script lang="ts" setup>
import AuPopup from '@/components/AuPopup/AuPopup.vue';
import { useVModels } from '@/uni_modules/tob-use/index.es.js';
import { aicLogoUrl, ballUniformBgUrl, peopleDefault } from '@/athletics/config/images';
import { TeamSignupDataRes } from '@/athletics/model/sport';
import { auditStatusMap } from '@/athletics/utils/util';
const emit = defineEmits<{
  (e: 'update:show', show: boolean): void;
  (e: 'close'): void;
}>();
interface AuPopupProps {
  show?: boolean;
  signupData?: Partial<TeamSignupDataRes>;
}
const props = withDefaults(defineProps<AuPopupProps>(), {
  show: false
});

const { show } = useVModels(props, emit);

function close() {
  emit('update:show', false);
  emit('close');
}
</script>

<style scoped lang="scss">
.team-member-list__item:not(:last-child) {
  border-bottom: 2rpx solid $u-border-color;
}
::v-deep .u-empty__text {
  width: 160px;
  text-align: center;
}
</style>
