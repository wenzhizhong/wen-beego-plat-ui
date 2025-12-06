/**
 * @description 提取菜单树中的每一项uniqueId
 * @param tree 树
 * @returns 每一项uniqueId组成的数组
 */
export const extractPathList = (tree: any[]): any => {
  if (!Array.isArray(tree)) {
    console.warn("tree must be an array");
    return [];
  }
  if (!tree || tree.length === 0) return [];
  const expandedPaths: Array<number | string> = [];
  for (const node of tree) {
    const hasChildren = node.children && node.children.length > 0;
    if (hasChildren) {
      extractPathList(node.children);
    }
    expandedPaths.push(node.uniqueId);
  }
  return expandedPaths;
};

/**
 * @description 如果父级下children的length为1，删除children并自动组建唯一uniqueId
 * @param tree 树
 * @param pathList 每一项的id组成的数组
 * @returns 组件唯一uniqueId后的树
 */
export const deleteChildren = (tree: any[], pathList = []): any => {
  if (!Array.isArray(tree)) {
    console.warn("menuTree must be an array");
    return [];
  }
  if (!tree || tree.length === 0) return [];
  for (const [key, node] of tree.entries()) {
    if (node.children && node.children.length === 1) delete node.children;
    node.id = key;
    node.parentId = pathList.length ? pathList[pathList.length - 1] : null;
    node.pathList = [...pathList, node.id];
    node.uniqueId =
      node.pathList.length > 1 ? node.pathList.join("-") : node.pathList[0];
    const hasChildren = node.children && node.children.length > 0;
    if (hasChildren) {
      deleteChildren(node.children, node.pathList);
    }
  }
  return tree;
};

/**
 * @description 创建层级关系
 * @param tree 树
 * @param pathList 每一项的id组成的数组
 * @returns 创建层级关系后的树
 */
export const buildHierarchyTree = (tree: any[], pathList = []): any => {
  if (!Array.isArray(tree)) {
    console.warn("tree must be an array");
    return [];
  }
  if (!tree || tree.length === 0) return [];
  for (const [key, node] of tree.entries()) {
    node.id = key;
    node.parentId = pathList.length ? pathList[pathList.length - 1] : null;
    node.pathList = [...pathList, node.id];
    const hasChildren = node.children && node.children.length > 0;
    if (hasChildren) {
      buildHierarchyTree(node.children, node.pathList);
    }
  }
  return tree;
};

/**
 * @description 广度优先遍历，根据唯一uniqueId找当前节点信息
 * @param tree 树
 * @param uniqueId 唯一uniqueId
 * @returns 当前节点信息
 */
export const getNodeByUniqueId = (
  tree: any[],
  uniqueId: number | string
): any => {
  if (!Array.isArray(tree)) {
    console.warn("menuTree must be an array");
    return [];
  }
  if (!tree || tree.length === 0) return [];
  const item = tree.find(node => node.uniqueId === uniqueId);
  if (item) return item;
  const childrenList = tree
    .filter(node => node.children)
    .map(i => i.children)
    .flat(1) as unknown;
  return getNodeByUniqueId(childrenList as any[], uniqueId);
};

/**
 * @description 向当前唯一uniqueId节点中追加字段
 * @param tree 树
 * @param uniqueId 唯一uniqueId
 * @param fields 需要追加的字段
 * @returns 追加字段后的树
 */
export const appendFieldByUniqueId = (
  tree: any[],
  uniqueId: number | string,
  fields: object
): any => {
  if (!Array.isArray(tree)) {
    console.warn("menuTree must be an array");
    return [];
  }
  if (!tree || tree.length === 0) return [];
  for (const node of tree) {
    const hasChildren = node.children && node.children.length > 0;
    if (
      node.uniqueId === uniqueId &&
      Object.prototype.toString.call(fields) === "[object Object]"
    )
      Object.assign(node, fields);
    if (hasChildren) {
      appendFieldByUniqueId(node.children, uniqueId, fields);
    }
  }
  return tree;
};

/**
 * @description 构造树型结构数据
 * @param data 数据源
 * @param id id字段 默认id
 * @param parentId 父节点字段，默认parentId
 * @param children 子节点字段，默认children
 * @returns 追加字段后的树
 */
export const handleTree = (
  data: any[],
  id?: string,
  parentId?: string,
  children?: string
): any => {
  if (!Array.isArray(data)) {
    console.warn("data must be an array");
    return [];
  }
  const config = {
    id: id || "id",
    parentId: parentId || "parentId",
    childrenList: children || "children"
  };

  const childrenListMap: any = {};
  const nodeIds: any = {};
  const tree = [];

  for (const d of data) {
    d[config.parentId] =  d[config.parentId] && typeof d[config.parentId] ==  'string'&& d[config.parentId].replace(/\s+/g, '') || "";
    const parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (const d of data) {
    const parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }

  for (const t of tree) {
    let pidArr= [t[config.id]];
    adaptToChildrenList(t, pidArr);
  }

  function adaptToChildrenList(o: Record<string, any>, pidArr: any[]) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    
    if (o[config.childrenList] && o[config.childrenList].length > 0) {
      for (const c of o[config.childrenList]) {
        let tmpPidArr = [...pidArr, c[config.id]];
        adaptToChildrenList(c, tmpPidArr);
        c.pids = pidArr
      }
    }
  }
  // console.log("tree=", tree)
  return tree;
};
/**
 * @description: 树形结构转级联数据
 * @param {Array} treeData
 * @param {Object} config
 * @return {Array}
 */
export const handleTreeToMap = (
  treeData = [], 
  id?: string,
  parentId?: string,
  children?: string
):any =>{
  if (!Array.isArray(treeData)) {
    console.warn("data must be an array");
    return [];
  }
  const config = {
    id: id || "id",
    parentId: parentId || "parentId",
    childrenList: children || "children"
  };
  
  let treeMap = {};
  function loopTreeData(itemNode :Object) { 
    if (itemNode[config.childrenList] && itemNode[config.childrenList].length > 0) { 
      let childrenIds = itemNode[config.childrenList].map(item => item[config.id])
      loopGetTreeMap(treeMap, itemNode[config.childrenList][0][config.parentId], childrenIds) 

      for(let j=0; j< itemNode[config.childrenList].length; j++){ 
        loopTreeData(itemNode[config.childrenList][j])
      }
    }else{
      loopGetTreeMap(treeMap, itemNode[config.parentId], [itemNode[config.id]])
    }
  }
  function loopGetTreeMap(tmpPidTree, findPid, childrenIds) { 
    for (const pid in tmpPidTree){
      if (pid === findPid) {
        for (const index in childrenIds) { 
          tmpPidTree[pid][childrenIds[index]] = {};
        }
        break;
      } else {
        tmpPidTree[pid] = loopGetTreeMap(tmpPidTree[pid], findPid, childrenIds);
      }
    }
    return tmpPidTree;
  }

  for(let i=0; i< treeData.length; i++){
    treeMap[treeData[i][config.id]] = {};
    loopTreeData(treeData[i]);
  }
  return treeMap;
}

// 获取嵌套的属性值（多层级）
export function getTreeMapByKeys(treeMap :Object, keysArr:string[]) : Object{
  if (!treeMap || !keysArr || !keysArr.length) return {};
  function getNestedValue(obj, path) {
      return path.reduce((obj, key) => obj?.[key], obj);
  }

  return getNestedValue(treeMap, keysArr)
}
// 转TreeMap key为一维数组
export function getTreeMapKeys(treeMap :Object) :string[]{
  if (!treeMap) return [];
  function getNestedValue(obj) {
    let data = obj && Object.keys(obj) || [];
    for (let i = 0; i < data.length; i++) {
      if (typeof obj[ data[i] ] === 'object') {

        let tmpData =  Object.keys(obj[ data[i] ]) || [];
        for (let j = 0; j < tmpData.length; j++) {
          data.push(tmpData[j]);
          if (obj[ data[i] ][ tmpData[j] ]){
              let tmpData2 = getNestedValue(obj[ data[i] ][ tmpData[j] ]);
              data = data.concat(tmpData2);
          }
        }
      }
    }
    return data;
  }

  let data = {};
  let tmpData = getNestedValue(treeMap)
  
  for (let i = 0; i < tmpData.length; i++){
    data[tmpData[i]] = 1;
  }
  return Object.keys(data);
}