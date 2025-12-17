<template>
  <div class="cron-generator">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 秒 -->
      <el-tab-pane label="秒" name="second">
        <cron-field 
          :type="'second'" 
          :value="cronData.second" 
          @change="handleFieldChange"
        />
      </el-tab-pane>
      
      <!-- 分钟 -->
      <el-tab-pane label="分钟" name="minute">
        <cron-field 
          :type="'minute'" 
          :value="cronData.minute" 
          @change="handleFieldChange"
        />
      </el-tab-pane>
      
      <!-- 小时 -->
      <el-tab-pane label="小时" name="hour">
        <cron-field 
          :type="'hour'" 
          :value="cronData.hour" 
          @change="handleFieldChange"
        />
      </el-tab-pane>
      
      <!-- 日 -->
      <el-tab-pane label="日" name="day">
        <cron-field 
          :type="'day'" 
          :value="cronData.day" 
          @change="handleFieldChange"
        />
      </el-tab-pane>
      
      <!-- 月 -->
      <el-tab-pane label="月" name="month">
        <cron-field 
          :type="'month'" 
          :value="cronData.month" 
          @change="handleFieldChange"
        />
      </el-tab-pane>
      
      <!-- 周 -->
      <el-tab-pane label="周" name="week">
        <cron-field 
          :type="'week'" 
          :value="cronData.week" 
          @change="handleFieldChange"
        />
      </el-tab-pane>
      
      <!-- 年 -->
      <!-- <el-tab-pane label="年" name="year">
        <cron-field 
          :type="'year'" 
          :value="cronData.year" 
          @change="handleFieldChange"
        />
      </el-tab-pane> -->
    </el-tabs>
    
    <!-- 结果展示 -->
    <div class="result-container">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-input v-model="expression" readonly placeholder="生成的cron表达式">
            <template #prepend>Cron表达式</template>
          </el-input>
        </el-col>
      </el-row><br/>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-input v-model="description" readonly placeholder="表达式含义">
            <template #prepend>中文含义</template>
          </el-input>
        </el-col>
      </el-row>
    </div>
    
    <!-- 操作按钮 -->
    <div class="button-container">
      <el-button @click="reset">重置</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import CronField from './CronField.vue'
import { parseExpression } from './cronUtils'

// 定义 emit
const emit = defineEmits<{
  (e: 'confirm', data: { expression: string; description: string }): void
}>()

// 活动标签页
const activeTab = ref('second')

// cron 数据
const cronData = reactive({
  second: '*',
  minute: '*',
  hour: '*',
  day: '*',
  month: '*',
  week: '?',
  year: ''
})

// 生成表达式
const expression = computed(() => {
  const exp = [
    cronData.second,
    cronData.minute,
    cronData.hour,
    cronData.day,
    cronData.month,
    cronData.week,
    cronData.year
  ].filter(item => item !== undefined).join(' ')
  
  return exp.trim()
})

// 解析表达式为中文描述
const description = computed(() => {
  try {
    return parseExpression(expression.value)
  } catch (error) {
    return '无法解析表达式'
  }
})

// 处理字段变化
const handleFieldChange = (type: string, value: string) => {
  // 特殊处理日和周的互斥关系
  if (type === 'day' && value !== '?' && cronData.week !== '?') {
    cronData.week = '?'
  }
  if (type === 'week' && value !== '?' && cronData.day !== '?') {
    cronData.day = '?'
  }
  
  cronData[type as keyof typeof cronData] = value
}

// 重置
const reset = () => {
  Object.assign(cronData, {
    second: '*',
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    week: '?',
    year: ''
  })
}

// 确认
const confirm = () => {
  emit('confirm', {
    expression: expression.value,
    description: description.value
  })
  reset()
}
</script>

<style scoped>
.cron-generator {
  padding: 20px;
}

.result-container {
  margin: 20px 0;
}

.button-container {
  text-align: right;
  margin-top: 20px;
}
</style>