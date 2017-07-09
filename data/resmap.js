/**
 * 所有资源和相关的ctrl的对应列表, 在ctrl的ui初始化之前必须加载;
 * resource_status: loaded | unload | loading 资源的状态;
 * res_relatives 和当前的资源相关的资源, 用户可能下一步操作所需的资源;
 */
let RESMAP = [{
    name: 'hall',
    res: RES.hall,
    res_dependencies: [], // 依赖资源
    res_relatives: [], // 关联资源
    resource_status: 'unload'
  },
  // ...
];