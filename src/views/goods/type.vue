<style lang="less" scoped>
    @import './type.less';
</style>

<template>
    <div>
        <Row>
            <Col span="24">
                <Card style="margin-bottom: 10px">
                    <Form inline>
                        <FormItem style="margin-bottom: 0">
                            <Input v-model="searchConf.name" clearable placeholder="请输入名称"></Input>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Select v-model="searchConf.status" clearable placeholder='请选择状态' style="width:100px">
                                <Option :value="1">启用</Option>
                                <Option :value="0">禁用</Option>
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
                        <Button type="primary" @click="alertAdd" icon="md-add">新增</Button>
                    </p>
                    <div>
                        <Table :loading="tableLoading" :columns="columnsList" :data="tableData" border disabled-hover></Table>
                    </div>
                    <div class="margin-top-15" style="text-align: center">
                        <Page :total="tableShow.listCount" :current="tableShow.currentPage"
                              :page-size="tableShow.pageSize" @on-change="changePage"
                              @on-page-size-change="changeSize" show-elevator show-sizer show-total></Page>
                    </div>
                </Card>
            </Col>
        </Row>
        <!--表单-->
        <Modal v-model="modalSetting.show" width="668" :styles="{top: '30px'}" @on-visible-change="doCancel">
            <p slot="header" style="color:#2d8cf0;">
                <Icon type="md-information-circle"></Icon>
                <span>{{formItem.id ? '编辑' : '新增'}}类型</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
                <FormItem label="类型名称" prop="name">
                    <Input v-model="formItem.name" placeholder="请输入类型名称"></Input>
                </FormItem>
                <FormItem label="类型图片" prop="img">
                    <div class="demo-upload-list" v-if="formItem.img">
                        <img :src="formItem.img">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="handleView()"></Icon>
                            <Icon type="ios-trash-outline" @click.native="handleImgRemove()"></Icon>
                        </div>
                    </div>
                    <input v-if="formItem.img" v-model="formItem.img" type="hidden" name="image">
                    <Upload type="drag"
                            :action="uploadUrl"
                            :headers="uploadHeader"
                            v-if="!formItem.img"
                            :format="['jpg','jpeg','png']"
                            :max-size="5120"
                            :on-success="handleImgSuccess"
                            :on-format-error="handleImgFormatError"
                            :on-exceeded-size="handleImgMaxSize"
                            style="display: inline-block;width:58px;">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                            <Icon type="ios-camera" size="20"></Icon>
                        </div>
                    </Upload>
                    <Modal title="View Image" v-model="visible">
                        <img :src="formItem.img" v-if="visible" style="width: 100%">
                    </Modal>
                </FormItem>
                <FormItem label="类型描述" prop="describe">
                    <Input v-model="formItem.describe" :autosize="{maxRows: 10, minRows: 4}" type="textarea" placeholder="请输入类型描述"></Input>
                </FormItem>
                <FormItem label="类型排序" prop="sort">
                    <InputNumber :min="0" v-model="formItem.sort"></InputNumber>
                    <Tag color="error" style="margin-left:5px">数字越小越靠前</Tag>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancel" style="margin-right: 8px">取消</Button>
                <Button type="primary" @click="submit" :loading="modalSetting.loading">确定</Button>
            </div>
        </Modal>
        <!--查看大图-->
        <Modal :title="formItem.name"
               v-model="modalSeeingImg.show"
               class-name="fl-image-modal"
               @on-visible-change="doCancel">
            <img :src="formItem.img" v-if="modalSeeingImg.show" style="width: 100%">
        </Modal>
    </div>
</template>

<script>
    import axios from 'axios';
    import config from '../../../build/config';

    // 编辑
    const editButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: 'primary'
            },
            style: {
                margin: '0 5px'
            },
            on: {
                'click': () => {
                    vm.formItem.id = currentRow.id;
                    vm.formItem.name = currentRow.name;
                    vm.formItem.img = currentRow.img;
                    vm.formItem.describe = currentRow.describe;
                    vm.formItem.sort = currentRow.sort;
                    vm.modalSetting.show = true;
                    vm.modalSetting.index = index;
                }
            }
        }, '编辑');
    };

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
                    axios.get('GoodsTypeCon/del', {
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
        name: 'goods_type',
        data () {
            return {
                // 初始化表格
                columnsList: [
                    {
                        title: '序号',
                        type: 'index',
                        width: 65,
                        align: 'center'
                    },
                    {
                        title: '类型名称',
                        align: 'left',
                        key: 'name',
                        width: 200
                    },
                    {
                        title: '类型图片',
                        align: 'center',
                        key: 'img',
                        width: 200
                    },
                    {
                        title: '类型描述',
                        align: 'left',
                        key: 'describe'
                    },
                    {
                        title: '排序',
                        align: 'center',
                        key: 'sort',
                        width: 80
                    },
                    {
                        title: '状态',
                        align: 'center',
                        key: 'status',
                        width: 100
                    },
                    {
                        title: '操作',
                        align: 'center',
                        key: 'handle',
                        width: 200,
                        handle: ['edit', 'delete']
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
                    name: '',
                    status: ''
                },
                // 初始化编辑/新增弹出框
                modalSetting: {
                    show: false,
                    loading: false,
                    index: 0
                },
                // 初始化图片弹出框
                modalSeeingImg: {
                    show: false
                },
                // 初始化表单数据
                formItem: {
                    name: '',
                    img: '',
                    describe: '',
                    sort: 0,
                    id: 0
                },
                // 表单验证规则
                ruleValidate: {
                    name: [
                        { required: true, message: '类型名称不能为空', trigger: 'blur' }
                    ],
                    img: [
                        { required: true, message: '请上传类型图片', trigger: 'change' }
                    ]
                },
                // 编辑/添加弹窗中显示大图
                visible: false,
                // 上传地址
                uploadUrl: '',
                // 上传头部信息
                uploadHeader: {}
            };
        },
        created () {
            this.init();
            this.getList();
        },
        methods: {
            // 初始化页面
            init () {
                let vm = this;
                this.columnsList.forEach(item => {
                    // 操作列
                    if (item.handle) {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('div', [
                                editButton(vm, h, currentRowData, param.index),
                                deleteButton(vm, h, currentRowData, param.index)
                            ]);
                        };
                    }
                    // 图片列
                    if (item.key === 'img') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            if (currentRowData.img) {
                                return h('img', {
                                    style: {
                                        width: '40px',
                                        height: '40px',
                                        cursor: 'pointer',
                                        'margin-top': '5px'
                                    },
                                    attrs: {
                                        src: currentRowData.img,
                                        shape: 'square',
                                        size: 'large'
                                    },
                                    on: {
                                        click: (e) => {
                                            this.formItem.img = currentRowData.img;
                                            this.formItem.name = currentRowData.name;
                                            vm.modalSeeingImg.show = true;
                                        }
                                    }
                                });
                            } else {
                                return h('Tag', {}, '暂无图片');
                            }
                        };
                    }
                    // 状态列
                    if (item.key === 'status') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('i-switch', {
                                attrs: {
                                    size: 'large'
                                },
                                props: {
                                    'true-value': 1,
                                    'false-value': 0,
                                    value: currentRowData.status
                                },
                                on: {
                                    'on-change' : function (status) {
                                        axios.get('GoodsTypeCon/changeStatus', {
                                            params: {
                                                status: status,
                                                id: currentRowData.id
                                            }
                                        }).then(function (response) {
                                            let res = response.data;
                                            if (res.code === 1) {
                                                vm.$Message.success(res.msg);
                                            } else {
                                                if (res.code === -14) {
                                                    vm.$store.commit('logout', vm);
                                                    vm.$router.push({
                                                        name: 'login'
                                                    });
                                                } else {
                                                    vm.$Message.error(res.msg);
                                                    vm.getList();
                                                }
                                            }
                                            vm.cancel();
                                        });
                                    }
                                }
                            }, [
                                h('span', {
                                    slot: 'open'
                                }, '启用'),
                                h('span', {
                                    slot: 'close'
                                }, '禁用')
                            ]);
                        };
                    }
                });
                this.uploadUrl = config.baseUrl + 'Index/upload';
                this.uploadHeader = {'ApiAuth': sessionStorage.getItem('apiAuth')};
            },
            // 新增数据弹出框
            alertAdd () {
                this.modalSetting.show = true;
            },
            // 表单提交
            submit () {
                let self = this;
                this.$refs['myForm'].validate((valid) => {
                    if (valid) {
                        self.modalSetting.loading = true;
                        let target = 'GoodsTypeCon/aoe';
                        axios.post(target, this.formItem).then(function (response) {
                            if (response.data.code === 1) {
                                self.$Message.success(response.data.msg);
                            } else {
                                self.$Message.error(response.data.msg);
                            }
                            self.getList();
                            self.cancel();
                        });
                    }
                });
            },
            // 表单取消
            cancel () {
                this.modalSetting.show = false;
            },
            // 表单取消关闭时触发
            doCancel (data) {
                if (!data) {
                    this.formItem.id = 0;
                    this.$refs['myForm'].resetFields();
                    this.modalSetting.loading = false;
                    this.modalSetting.index = 0;
                }
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
                axios.get('GoodsTypeCon/index', {
                    params: {
                        page: vm.tableShow.currentPage,
                        size: vm.tableShow.pageSize,
                        name: vm.searchConf.name,
                        status: vm.searchConf.status
                    }
                }).then(function (response) {
                    let res = response.data;
                    vm.tableLoading = false;
                    if (res.code === 1) {
                        vm.tableData = res.data.list;
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
            // 上传图片一系列
            handleView () {
                this.visible = true;
            },
            handleImgRemove () {
                this.formItem.img = '';
            },
            handleImgFormatError (file) {
                this.$Notice.warning({
                    title: '文件类型不合法',
                    desc: file.name + '的文件类型不正确，请上传jpg或者png图片。'
                });
            },
            handleImgMaxSize (file) {
                this.$Notice.warning({
                    title: '文件大小不合法',
                    desc: file.name + '太大啦请上传小于5M的文件。'
                });
            },
            handleImgSuccess (response) {
                if (response.code === 1) {
                    this.$Message.success(response.msg);
                    this.formItem.img = response.data.fileUrl;
                } else {
                    this.$Message.error(response.msg);
                }
            }
        }
    };
</script>
