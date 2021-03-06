import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: () => import('@/views/login.vue')
};

export const page404 = {
    path: '/*',
    name: 'error_404',
    meta: {
        title: '404-页面不存在'
    },
    component: () => import('@/views/error_page/404.vue')
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足'
    },
    name: 'error_403',
    component: () => import('@/views/error_page/403.vue')
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error_500',
    component: () => import('@/views/error_page/500.vue')
};

export const locking = {
    path: '/locking',
    name: 'locking',
    component: () => import('@/views/main_components/lock_screen/components/locking-page.vue')
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [
        {
            path: 'home',
            title: {i18n: 'home'},
            name: 'home_index',
            component: () => import('@/views/home/home.vue')
        },
        {
            path: 'own',
            title: '个人中心',
            name: 'own_index',
            component: () => import('@/views/own/index.vue')
        },
        {
            path: 'request/:hash',
            title: '请求参数',
            name: 'interface_request',
            component: () => import('@/views/interface/request.vue')
        },
        {
            path: 'response/:hash',
            title: '返回参数',
            name: 'interface_response',
            component: () => import('@/views/interface/response.vue')
        },
        {
            path: 'address/:id/:name',
            title: '收货地址',
            name: 'user_address',
            component: () => import('@/views/user/address.vue')
        },
        {
            path: 'coupon/:id/:name',
            title: '优惠券',
            name: 'user_coupon',
            component: () => import('@/views/user/coupon.vue')
        },
    ]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
    {
        path: '/system',
        icon: 'ios-build',
        name: 'system',
        title: '系统配置',
        component: Main,
        children: [
            {
                path: 'menu',
                icon: 'md-menu',
                name: 'menu',
                access: 'admin/Menu/index',
                title: '菜单维护',
                component: () => import('@/views/system/menu.vue')

            },
            {
                path: 'user',
                icon: 'ios-people',
                name: 'user',
                access: 'admin/User/index',
                title: '用户管理',
                component: () => import('@/views/system/user.vue')
            },
            {
                path: 'auth',
                icon: 'md-warning',
                name: 'auth',
                access: 'admin/Auth/index',
                title: '权限管理',
                component: () => import('@/views/system/auth.vue')
            },
            {
                path: 'log',
                icon: 'md-list-box',
                name: 'log',
                access: 'admin/Log/index',
                title: '操作日志',
                component: () => import('@/views/system/log.vue')
            }
        ]
    },
    {
        path: "/app",
        icon: 'md-globe',
        name: "app",
        title: "应用接入",
        component: Main,
        children: [
            {
                path: "group",
                icon: 'logo-buffer',
                name: "app_group",
                access: 'admin/AppGroup/index',
                title: "应用分组",
                component: () => import('@/views/app/group.vue')
            },
            {
                path: "index",
                icon: "md-code-working",
                name: "app_index",
                access: 'admin/App/index',
                title: "应用列表",
                component: () => import('@/views/app/list.vue')
            }
        ]
    },
    {
        path: "/interface",
        icon: "md-cube",
        name: "interface",
        title: "接口管理",
        component: Main,
        children: [
            {
                path: "group",
                icon: "ios-folder-open",
                name: "interface_group",
                access: 'admin/InterfaceGroup/index',
                title: "接口分组",
                component: () => import('@/views/interface/group.vue')
            },
            {
                path: "list",
                icon: "ios-document-outline",
                name: "interface_list",
                access: 'admin/InterfaceList/index',
                title: "接口列表",
                component: () => import('@/views/interface/list.vue')
            }
        ]
    },
    {
        path: "/user",
        icon: "md-cube",
        name: "user",
        title: "用户管理",
        component: Main,
        children: [
            {
                path: "list",
                icon: "ios-folder-open",
                name: "user_list",
                access: 'admin/UserCon/index',
                title: "用户管理",
                component: () => import('@/views/user/list.vue')
            }
        ]
    },
    {
        path: "/goods",
        icon: "md-cube",
        name: "goods",
        title: "商品管理",
        component: Main,
        children: [
            {
                path: "type",
                icon: "ios-folder-open",
                name: "goods_type",
                access: 'admin/GoodsTypeCon/index',
                title: "商品类型",
                component: () => import('@/views/goods/type.vue')
            },
            {
                path: "list",
                icon: "ios-document-outline",
                name: "goods_list",
                access: 'admin/GoodsCon/index',
                title: "商品列表",
                component: () => import('@/views/goods/list.vue')
            }
        ]
    },
    {
        path: "/orders",
        icon: "md-cube",
        name: "orders",
        title: "订单管理",
        component: Main,
        children: [
            {
                path: "list",
                icon: "ios-document-outline",
                name: "orders_list",
                access: 'admin/OrdersCon/index',
                title: "订单列表",
                component: () => import('@/views/orders/list.vue')
            }
        ]
    },
    {
        path: "/logistics_company",
        icon: "md-cube",
        name: "logistics_company",
        title: "物流公司管理",
        component: Main,
        children: [
            {
                path: "list",
                icon: "ios-folder-open",
                name: "logistics_company_list",
                access: 'admin/LogisticsCompanyCon/index',
                title: "物流公司列表",
                component: () => import('@/views/logistics_company/list.vue')
            }
        ]
    },
    {
        path: "/coupon",
        icon: "md-cube",
        name: "coupon",
        title: "优惠券管理",
        component: Main,
        children: [
            {
                path: "type",
                icon: "ios-folder-open",
                name: "coupon_type",
                access: 'admin/CouponTypeCon/index',
                title: "优惠券类型",
                component: () => import('@/views/coupon/type.vue')
            },
            {
                path: "list",
                icon: "ios-folder-open",
                name: "coupon_list",
                access: 'admin/CouponCon/index',
                title: "优惠券列表",
                component: () => import('@/views/coupon/list.vue')
            }
        ]
    },
    {
        path: "/basic_config",
        icon: "md-cube",
        name: "basic_config",
        title: "基本配置",
        component: Main,
        children: [
            {
                path: "index",
                icon: "ios-folder-open",
                name: "basic_config_index",
                access: 'admin/BasicConfigCon/index',
                title: "基本配置",
                component: () => import('@/views/basic_config/index.vue')
            }
        ]
    },
    {
        path: "/banner",
        icon: "md-cube",
        name: "banner",
        title: "banner管理",
        component: Main,
        children: [
            {
                path: "list",
                icon: "ios-folder-open",
                name: "banner_list",
                access: 'admin/BannerCon/index',
                title: "banner列表",
                component: () => import('@/views/banner/list.vue')
            }
        ]
    },
    // {
    //     path: '/international',
    //     icon: 'earth',
    //     title: {i18n: 'international'},
    //     name: 'international',
    //     component: Main,
    //     children: [
    //         {
    //             path: 'index',
    //             title: {i18n: 'international'},
    //             name: 'international_index',
    //             component: () => import('@/views/international/international.vue')
    //         }
    //     ]
    // }
];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    locking,
    ...appRouter,
    page500,
    page403,
    page404
];
