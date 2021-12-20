<template>
  <n-element class="login-box">
    <n-grid :cols="3" style="height: 100%;">
      <n-grid-item :span="2">
        <img src="../assets/login-logo.png" style="width: 100%;height: 100%;object-fit: cover;">
      </n-grid-item>
      <n-grid-item>
        <div class="login-control">
          <n-button #icon class="control-button-close" quaternary @click="ipcRenderer.send('windows', {mode: 'close'})">
            <n-icon>
              <component :is="antd.CloseOutlined"/>
            </n-icon>
          </n-button>
        </div>
        <n-form
          :model="formData"
          :rules="rules"
          class="login-form"
          label-placement="left"
          style="text-align: center"
        >
          <n-form-item>
          </n-form-item>
          <n-form-item style="display: inline-grid;">
            <img src="../assets/login-logo2.png">
          </n-form-item>
          <n-tabs default-value="signin" justify-content="space-evenly" size="large">
            <n-tab-pane name="signin" tab="登录">
              <n-form-item path="username">
                <n-input v-model:value="formData.username" allowClear autocomplete="off" placeholder="请输入用户"
                         style="text-align: initial">
                  <template #prefix>
                    <n-icon>
                      <component :is="antd.UserOutlined"/>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item path="password">
                <n-input v-model:value="formData.password" allowClear autocomplete="off" placeholder="请输入密码"
                         style="text-align: initial"
                         type="password">
                  <template #prefix>
                    <n-icon>
                      <component :is="antd.LockOutlined"/>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item>
                <n-button attr-type="button" block type="primary" @click="signin">登录</n-button>
              </n-form-item>
            </n-tab-pane>
            <n-tab-pane name="signup" tab="注册">
              <n-form-item path="username">
                <n-input v-model:value="formData.username" allowClear autocomplete="off" placeholder="请输入用户"
                         style="text-align: initial">
                  <template #prefix>
                    <n-icon>
                      <component :is="antd.UserOutlined"/>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item path="password">
                <n-input v-model:value="formData.password" allowClear autocomplete="off" placeholder="请输入密码"
                         style="text-align: initial"
                         type="password">
                  <template #prefix>
                    <n-icon>
                      <component :is="antd.LockOutlined"/>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item path="superPassword">
                <n-input v-model:value="formData.superPassword" allowClear autocomplete="off" placeholder="请输入超级密码"
                         style="text-align: initial"
                         type="password">
                  <template #prefix>
                    <n-icon>
                      <component :is="antd.LockOutlined"/>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item>
                <n-button attr-type="button" block type="primary" @click="signup">注册</n-button>
              </n-form-item>
            </n-tab-pane>
            <n-tab-pane name="charge" tab="充值">
              <n-form-item path="username">
                <n-input v-model:value="formData.username" allowClear autocomplete="off" placeholder="请输入用户"
                         style="text-align: initial">
                  <template #prefix>
                    <n-icon>
                      <component :is="antd.UserOutlined"/>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item path="card">
                <n-input v-model:value="formData.card" allowClear autocomplete="off" placeholder="请输入卡号"
                         style="text-align: initial">
                  <template #prefix>
                    <n-icon>
                      <component :is="antd.LockOutlined"/>
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item>
                <n-button attr-type="button" block type="primary" @click="charge">充值</n-button>
              </n-form-item>
            </n-tab-pane>
          </n-tabs>
        </n-form>
      </n-grid-item>
    </n-grid>
  </n-element>
</template>

<script setup>
import {
  NIcon,
  NButton,
  NGrid,
  NGridItem,
  NForm,
  NFormItem,
  NInput,
  NElement,
  NTabs,
  NTabPane,
  useMessage
} from 'naive-ui'
import {reactive} from 'vue'
import {useRouter} from 'vue-router'
import {antd, useIpc} from '../composables'

const ipcRenderer = useIpc()
const message = useMessage()
const router = useRouter()
const users = ipcRenderer.sendSync('store', {
  mode: 0,
  key: 'users',
}).return_msg
const formData = reactive({
  username: users.username || '',
  password: users.password || '',
  superPassword: '',
  card: '',
})
const rules = reactive({
  username: [{
    required: true,
    message: '请输入用户名',
    trigger: ['input']
  }],
  password: [{
    required: true,
    message: '请输入密码',
    trigger: ['input']
  }]
})
const signin = async () => {
  document.documentElement.style.setProperty('--animate-duration', '.5s')
  ipcRenderer.sendSync('store', {
    mode: 1,
    key: 'users',
    value: {
      username: formData.username,
      password: formData.password,
      authorization: "123"
    }
  })
  await router.push({
    name: 'VTT'
  })
}
const signup = async () => {

}
const charge = async () => {

}
</script>

<style lang="less" scoped>
.login-box {
  line-height: 0;
  background-color: var(--body-color);
  border: 1px solid var(--avatar-color);
  box-sizing: border-box;
  -webkit-app-region: drag;
  height: 100VH;
  width: 100VW;
}

.login-control {
  -webkit-app-region: no-drag;
  position: absolute;
  right: 2px;
  top: 2px;
}

.control-button-close:hover {
  color: var(--base-color);
  background-color: var(--error-color-suppl) !important;
}

.login-form {
  -webkit-app-region: no-drag;
  padding: 0 35px !important;
  margin-top: 36px;
}
</style>
