<template>
  <div class="cron-field">
    <el-radio-group v-model="currentType" @change="handleTypeChange">
      <el-radio label="every">每{{ unit }}</el-radio>
      <el-radio label="range">区间</el-radio>
      <el-radio label="cycle">循环</el-radio>
      <el-radio label="appoint">指定</el-radio>
      <el-radio v-if="showUnset" label="unset">不设置</el-radio>
    </el-radio-group>
    
    <!-- 区间选择 -->
    <div v-if="currentType === 'range'" class="field-option">
      <span>从</span>
      <el-input-number 
        v-model="rangeStart" 
        :min="minValue" 
        :max="maxValue" 
        size="small"
        @change="updateExpression"
      />
      <span>到</span>
      <el-input-number 
        v-model="rangeEnd" 
        :min="minValue" 
        :max="maxValue" 
        size="small"
        @change="updateExpression"
      />
      <span>{{ unit }}</span>
    </div>
    
    <!-- 循环选择 -->
    <div v-if="currentType === 'cycle'" class="field-option">
      <span>从</span>
      <el-input-number 
        v-model="cycleStart" 
        :min="minValue" 
        :max="maxValue" 
        size="small"
        @change="updateExpression"
      />
      <span>{{ unit }}开始，每</span>
      <el-input-number 
        v-model="cycleStep" 
        :min="1" 
        :max="maxValue" 
        size="small"
        @change="updateExpression"
      />
      <span>{{ unit }}执行一次</span>
    </div>
    
    <!-- 指定选择 -->
    <div v-if="currentType === 'appoint'" class="field-option">
      <el-select 
        v-model="appointValues" 
        multiple 
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="6"
        :placeholder="'请选择' + unit"
        @change="updateExpression"
      >
        <el-option
          v-for="i in options"
          :key="i.value"
          :label="i.label"
          :value="i.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
  type: string
  value: string
}>()

const emit = defineEmits<{
  (e: 'change', type: string, value: string): void
}>()

// 当前类型
const currentType = ref('every')

// 范围值
const rangeStart = ref(0)
const rangeEnd = ref(0)

// 循环值
const cycleStart = ref(0)
const cycleStep = ref(1)

// 指定值
const appointValues = ref<(number | string)[]>([])

// 各字段配置
const fieldConfig = computed(() => {
  switch (props.type) {
    case 'second':
      return { min: 0, max: 59, unit: '秒' }
    case 'minute':
      return { min: 0, max: 59, unit: '分钟' }
    case 'hour':
      return { min: 0, max: 23, unit: '小时' }
    case 'day':
      return { min: 1, max: 31, unit: '日' }
    case 'month':
      return { min: 1, max: 12, unit: '月' }
    case 'week':
      return { min: 1, max: 7, unit: '周' }
    case 'year':
      return { min: 2023, max: 2099, unit: '年' }
    default:
      return { min: 0, max: 0, unit: '' }
  }
})

const minValue = computed(() => fieldConfig.value.min)
const maxValue = computed(() => fieldConfig.value.max)
const unit = computed(() => fieldConfig.value.unit)

// 是否显示不设置选项
const showUnset = computed(() => ['day', 'week'].includes(props.type))

// 下拉选项
const options = computed(() => {
  const result = []
  for (let i = minValue.value; i <= maxValue.value; i++) {
    result.push({
      value: i,
      label: `${i}${unit.value}`
    })
  }
  return result
})

// 初始化值
onMounted(() => {
  initValue()
})

// 监听外部值变化
watch(() => props.value, () => {
  initValue()
})

// 初始化当前值
const initValue = () => {
  const value = props.value
  
  if (!value || value === '*') {
    currentType.value = 'every'
    return
  }
  
  if (value === '?') {
    currentType.value = 'unset'
    return
  }
  
  if (value.includes('-')) {
    const [start, end] = value.split('-')
    rangeStart.value = parseInt(start)
    rangeEnd.value = parseInt(end)
    currentType.value = 'range'
    return
  }
  
  if (value.includes('/')) {
    const [start, step] = value.split('/')
    cycleStart.value = start === '*' ? 0 : parseInt(start)
    cycleStep.value = parseInt(step)
    currentType.value = 'cycle'
    return
  }
  
  if (value.includes(',')) {
    appointValues.value = value.split(',').map(v => parseInt(v))
    currentType.value = 'appoint'
    return
  }
  
  // 单个数值
  const numValue = parseInt(value)
  if (!isNaN(numValue)) {
    appointValues.value = [numValue]
    currentType.value = 'appoint'
  }
}

// 类型改变处理
const handleTypeChange = () => {
  updateExpression()
}

// 更新表达式
const updateExpression = () => {
  let result = '*'
  
  switch (currentType.value) {
    case 'every':
      result = '*'
      break
    case 'range':
      result = `${rangeStart.value}-${rangeEnd.value}`
      break
    case 'cycle':
      result = `${cycleStart.value}/${cycleStep.value}`
      break
    case 'appoint':
      result = appointValues.value.length > 0 
        ? appointValues.value.join(',') 
        : '*'
      break
    case 'unset':
      result = '?'
      break
  }
  
  emit('change', props.type, result)
}
</script>

<style scoped>
.cron-field {
  padding: 20px 0;
}

.field-option {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>