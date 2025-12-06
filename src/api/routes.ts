import { http } from "@/utils/http";
import { handleTree } from "@/utils/tree";
import { uniqueArr } from "@/utils/util.js";
import { GET_ASYNC_ROUTES } from "@/api/api";

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  return http.request<Result>("get", GET_ASYNC_ROUTES).then((res) => {
    res.data = handleTree(res.data || [], "id", "parentId", "children");
    let newData = remakeRoutes(res.data);
    
    newData.forEach((item) => {
      if (!item.children || !item.children.length) {
        delete item.name;
        delete item.children;
        return item;
      }
      item.meta.roles = item.meta && item.meta.roles || [];
      item.children.forEach((child) => {
        let thirdLevelAuths = [];
        if(child.meta && child.meta.roles) 
          item.meta.roles = item.meta.roles.concat(child.meta.roles);

        if (child.children) {
          child.children.forEach((child2) => {
            thirdLevelAuths = thirdLevelAuths.concat(child2.meta.auths)
            
            if(child2.meta && child2.meta.roles) 
              item.meta.roles = item.meta.roles.concat(child2.meta.roles);
          })
          delete child.children;
        }
        child.meta.auths = [...child.meta.auths, ...thirdLevelAuths]
      });
      item.meta.roles = uniqueArr(item.meta.roles);
      return item;
    });
    console.log("menu=\n",newData);
    res.data = newData;
    return res;
  });
};

function remakeRoutes(oldRoutes: Array<any>, parentRoute = null) {
  let newRoutes = [];
  if (!oldRoutes || !oldRoutes.length)
    return newRoutes;


  oldRoutes.map((item) => {

    let tmp = {
      path: item.component,
      name: item.name,
      component: item.component || null,
      meta: {
        title: item.title,
        roles: item.roles || [],
        // rank: weight<=0 ? null : weight*100,
        showLink: item.showLink,
        icon: item.icon,
        auths: item.auths || (item.path && [item.path.replace(/\//g, ':')]) || []
      },
    };

    if (item.children && item.children.length > 0) {
      tmp['children'] = remakeRoutes(item.children, tmp);
    }
    newRoutes.push(tmp);
  });
  return newRoutes;
}
