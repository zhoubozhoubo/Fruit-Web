<style lang="less" scoped>
    @import './coupon.less';
</style>
<template>
    <div>
        <Row>
            <Col span="24">
                <Card style="margin-bottom: 10px">
                    <Form inline>
                        <FormItem style="margin-bottom: 0">
                            <Select v-model="searchConf.is_use" clearable placeholder='请选择状态' style="width:100px">
                                <Option :value="0">未使用</Option>
                                <Option :value="1">已使用</Option>
                            </Select>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Button type="primary" @click="search">查询/刷新</Button>
                        </FormItem>
                    </Form>
                </Card>
            </Col>
        </Row>
        <Row>
            <Col span="24">
                <Card>
                    <p slot="title" style="height: 32px">
                        <Button type="info" @click="goBack" icon="ios-arrow-back">{{user.name}}->优惠券</Button>
                        <!--<Button type="primary" @click="alertAdd" icon="md-add">新增</Button>-->
                        <Button type="error" @click="alertDel" icon="md-close" style="float: right">删除</Button>
                    </p>
                    <div>
                        <Table highlight-row :loading="tableLoading" :columns="columnsList" :data="tableData" border disabled-hover  @on-selection-change="handleRowChange" ref="selection"></Table>
                    </div>
                    <div class="margin-top-15" style="text-align: center">
                        <Page :total="tableShow.listCount" :current="tableShow.currentPage"
                              :page-size="tableShow.pageSize" @on-change="changePage"
                              @on-page-size-change="changeSize" show-elevator show-sizer show-total></Page>
                    </div>
                </Card>
            </Col>
        </Row>
        <!--删除确认-->
        <Modal v-model="modalDel.show"
               @on-ok="delAll">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="ios-information-circle"></Icon>
                <span>删除确认</span>
            </p>
            <div style="text-align:center">
                <p>删除后不可恢复，确定删除选中数据吗？</p>
            </div>
        </Modal>
    </div>
</template>
<script>
    import axios from 'axios';

    // 删除
    const deleteButton = (vm, h, currentRow, index) => {
        return h('Poptip', {
            props: {
                confirm: true,
                title: '您确定要删除这条数据吗? ',
                transfer: true
            },
            on: {
                'on-ok': () => {
                    axios.get('UserCouponCon/del', {
                        params: {
                            id: currentRow.id
                        }
                    }).then(function (response) {
                        currentRow.loading = false;
                        if (response.data.code === 1) {
                            vm.tableData.splice(index, 1);
                            vm.$Message.success(response.data.msg);
                        } else {
                            vm.$Message.error(response.data.msg);
                        }
                    });
                }
            }
        }, [
            h('Button', {
                style: {
                    margin: '0 5px'
                },
                props: {
                    type: 'error',
                    placement: 'top',
                    loading: currentRow.isDeleting
                }
            }, '删除')
        ]);
    };

    export default {
        name: 'user_coupon',
        data () {
            return {
                // 用户信息
                user: {
                    id: 0,
                    name: ''
                },
                // 初始化表格
                columnsList: [
                    {
                        type: 'selection',
                        width: 50,
                        align: 'center',
                        key: 'id'
                    },
                    {
                        title: '序号',
                        type: 'index',
                        width: 65,
                        align: 'center'
                    },
                    {
                        title: '优惠券名称',
                        align: 'left',
                        key: 'coupon_name'
                    },
                    {
                        title: '优惠券期限天数',
                        align: 'center',
                        key: 'coupon_term'
                    },
                    {
                        title: '开始日期',
                        align: 'center',
                        key: 'start'
                    },
                    {
                        title: '截止日期',
                        align: 'center',
                        key: 'end'
                    },
                    {
                        title: '状态',
                        align: 'center',
                        key: 'is_use',
                        width: 100
                    },
                    {
                        title: '操作',
                        align: 'center',
                        key: 'handle',
                        width: 100,
                        handle: ['delete']
                    }
                ],
                // 表格加载状态
                tableLoading: false,
                // 表格数据
                tableData: [],
                // 表格分页属性
                tableShow: {
                    currentPage: 1,
                    pageSize: 10,
                    listCount: 0
                },
                // 初始化搜索
                searchConf: {
                    is_use: ''
                },
                // 初始化删除确认弹出框
                modalDel: {
                    show: false,
                    loading: false,
                    index: 0
                },
                // 选中id列表
                idList: ''
            };
        },
        components: {
        },
        created () {
            this.init();
        },
        activated () {
            this.user.id = this.$route.params.id.toString();
            this.user.name = this.$route.params.name.toString();
            this.getList();
        },
        methods: {
            // 返回上一页
            goBack () {
                this.$router.back();
            },
            // 初始化页面
            init () {
                let vm = this;
                this.columnsList.forEach(item => {
                    // 操作列
                    if (item.handle) {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('div', [
                                deleteButton(vm, h, currentRowData, param.index)
                            ]);
                        };
                    }
                    // 状态列
                    if (item.key === 'is_use') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            switch (currentRowData.is_use) {
                                case 0:
                                    return h('Tag', {
                                        attrs: {
                                            color: 'orange'
                                        }
                                    }, '未使用');
                                case 1:
                                    return h('Tag', {
                                        attrs: {
                                            color: 'default'
                                        }
                                    }, '已使用');
                            }
                        };
                    }
                });
            },
            // 删除数据弹出框
            alertDel () {
                this.modalDel.show = true;
            },
            // 改变当前页
            changePage (page) {
                this.tableShow.currentPage = page;
                this.getList();
            },
            // 改变分页数据条数
            changeSize (size) {
                this.tableShow.pageSize = size;
                this.getList();
            },
            // 搜索
            search () {
                this.tableShow.currentPage = 1;
                this.getList();
            },
            // 获取列表数据
            getList () {
                let vm = this;
                vm.tableLoading = true;
                axios.get('UserCouponCon/index', {
                    params: {
                        page: vm.tableShow.currentPage,
                        size: vm.tableShow.pageSize,
                        id: vm.user.id,
                        is_use: vm.searchConf.is_use
                    }
                }).then(function (response) {
                    let res = response.data;
                    vm.tableLoading = false;
                    if (res.code === 1) {
                        vm.tableData = res.data.list;
                        vm.tableShow.listCount = res.data.count;
                    } else {
                        if (res.code === -14) {
                            vm.$store.commit('logout', vm);
                            vm.$router.push({
                                name: 'login'
                            });
                        } else {
                            vm.$Message.error(res.msg);
                        }
                    }
                });
            },
            // 选中删除id列表
            handleRowChange (selection) {
                this.idList = '';
                for (var i = 0; i < selection.length; i++) {
                    this.idList += selection[i].id + ',';
                }
                this.idList = this.idList.substr(0, this.idList.length - 1);
            },
            // 批量删除
            delAll () {
                let vm = this;
                if (this.idList.length === 0) {
                    vm.$Message.error('请选择要删除的数据');
                    vm.cancel();
                } else {
                    axios.get('UserCouponCon/del', {
                        params: {
                            id: vm.idList
                        }
                    }).then(function (response) {
                        if (response.data.code === 1) {
                            vm.$Message.success(response.data.msg);
                        } else if (response.data.code === -12) {
                            vm.$Message.error(response.data.msg);
                            return;
                        } else {
                            vm.$Message.error(response.data.msg);
                        }
                        vm.getList();
                        vm.cancel();
                    });
                }
            }
        }
    };
</script>
