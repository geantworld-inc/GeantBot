const { ActivityType, ChannelType, Client, GuildMember } = require('discord.js')
const DBD = require("discord-dashboard")
const SelectedTheme = require("dbd-dark-dashboard")
const Verification = require("../../Schemas/Verification")
const WelcomeSchema = require("../../Schemas/Welcome")

module.exports = {
    name: "ready",
    /**
     * @param {Client} client
     * @param {GuildMember} member
     */
    async execute(member, client) {
        const { user } = client

        let Information = []
        let Moderation = []
        let Owner = []

        const info = client.commands.filter(x => x.category === "Information")
        const mod = client.commands.filter(x => x.category === "Moderation")
        const owner = client.commands.filter(x => x.category === "Owner")

        CommandPush(info, Information)
        CommandPush(mod, Moderation)
        CommandPush(owner, Owner)

        await DBD.useLicense(process.env.DBD)
        DBD.Dashboard = DBD.UpdatedClass()

        const Dashboard = new DBD.Dashboard({
        port: process.env.port,
        client: {
            id: process.env.clientId,
            secret: process.env.clientSecret
        },
        redirectUri: `http://localhost/discord/callback`,
        domain: `http://localhost:80/`,
        settings: [
            {
                categoryId: "Welcome",
                categoryName: "Welcome System",
                categoryDescription: "Setup the Welcome Channel",
                categoryOptionsList: [
                    {
                        optionId: "welch",
                        categoryName: "Welcome Channel",
                        optionDescription: "set or reset the server's welcome channel",
                        optionType: DBD.formTypes.channelsSelect(false, channelType = [ChannelType.GuildText]),
                        getActualSet: async ({ guild }) => {
                            let data = await WelcomeSchema.findOne({ Guild: guild.id })
                            if (data) return data.Channel
                            else return null
                        },
                        setNew: async ({ guild, newData }) => {
                            let data = await WelcomeSchema.findOne({Guild: guild.id}).catch(err => console.log(err))

                            if (!newData) newData = null

                            if (!data) {
                                data = new WelcomeSchema({
                                    Guild: guild.id,
                                    Channel: newData
                                })

                                await data.save()
            
                            } else {
                                data.Channel = newData
                                await data.save()
                            }

                            return
                        }
                    },
                    {
                        optionId: "welcmsg",
                        categoryName: "Welcome Message",
                        optionDescription: "Send Message to DM of newly joined member",
                        optionType: DBD.formTypes.embedBuilder({
                            username: user.username,
                            avatarURL: user.avatarURL(),
                            defaultJson: {
                                embed: {
                                    description: "Welcome"
                                }
                            }
                        }),
                        getActualSet: async ({ guild }) => {
                            let data = await WelcomeSchema.findOne({ Guild: guild.id })
                            if (data) return data.Messages
                            else return null
                        },
                        setNew: async ({ guild, newData }) => {
                            let data = await WelcomeSchema.findOne({Guild: guild.id}).catch(err => console.log(err))

                            if (!newData) newData = null

                            if (!data) {
                                data = new WelcomeSchema({
                                    Guild: guild.id,
                                    Channel: null,
                                    Messages: newData,
                                    DM: false,
                                    DMMessage: null,
                                    Content: false,
                                    Embed: false
                                })

                                await data.save()
            
                            } else {
                                data.Messages = newData
                                await data.save()
                            }

                            return
                        }
                    },
                    {
                        optionId: "weldm",
                        categoryName: "Welcome DM",
                        optionDescription: "Enable or Disable Welcome Message (in DM)",
                        optionType: DBD.formTypes.switch(false),
                        getActualSet: async ({ guild }) => {
                            let data = await WelcomeSchema.findOne({ Guild: guild.id })
                            if (data) return data.DM
                            else return null
                        },
                        setNew: async ({ guild, newData }) => {
                            let data = await WelcomeSchema.findOne({Guild: guild.id}).catch(err => console.log(err))

                            if (!newData) newData = null

                            if (!data) {
                                data = new WelcomeSchema({
                                    Guild: guild.id,
                                    Channel: null,
                                    Messages: null,
                                    DM: newData,
                                    DMMessage: null,
                                    Content: false,
                                    Embed: false
                                })

                                await data.save()
            
                            } else {
                                data.DM = newData
                                await data.save()
                            }

                            return
                        }
                    },
                    {
                        optionId: "welcopt",
                        categoryName: "Welcome DM Options",
                        optionDescription: "Send Content",
                        optionType: DBD.formTypes.switch(false),
                        themeOptions: {
                            minimalbutton: {
                                first: true
                            }
                        },
                        getActualSet: async ({ guild }) => {
                            let data = await WelcomeSchema.findOne({ Guild: guild.id })
                            if (data) return data.Content
                            else return null
                        },
                        setNew: async ({ guild, newData }) => {
                            let data = await WelcomeSchema.findOne({Guild: guild.id}).catch(err => console.log(err))

                            if (!newData) newData = null

                            if (!data) {
                                data = new WelcomeSchema({
                                    Guild: guild.id,
                                    Channel: null,
                                    Messages: null,
                                    DM: false,
                                    DMMessage: null,
                                    Content: newData,
                                    Embed: false
                                })

                                await data.save()
            
                            } else {
                                data.Content = newData
                                await data.save()
                            }

                            return
                        }
                    },
                    {
                        optionId: "welcemb",
                        categoryName: "Welcome Embed",
                        optionDescription: "Send Embed",
                        optionType: DBD.formTypes.switch(false),
                        themeOptions: {
                            minimalbutton: {
                                last: true
                            }
                        },
                        getActualSet: async ({ guild }) => {
                            let data = await WelcomeSchema.findOne({ Guild: guild.id })
                            if (data) return data.Embed
                            else return null
                        },
                        setNew: async ({ guild, newData }) => {
                            let data = await WelcomeSchema.findOne({Guild: guild.id}).catch(err => console.log(err))

                            if (!newData) newData = null

                            if (!data) {
                                data = new WelcomeSchema({
                                    Guild: guild.id,
                                    Channel: null,
                                    Messages: null,
                                    DM: false,
                                    DMMessage: null,
                                    Content: false,
                                    Embed: newData
                                })

                                await data.save()
            
                            } else {
                                data.Embed = newData
                                await data.save()
                            }

                            return
                        }
                    },
                    {
                        optionId: "welcdmmsg",
                        categoryName: "Welcome Message (in dm)",
                        optionDescription: "Send Message to DM of newly joined member",
                        optionType: DBD.formTypes.embedBuilder({
                            username: user.username,
                            avatarURL: user.avatarURL(),
                            defaultJson: {
                                content: "Welcome",
                                embed: {
                                    description: "Welcome to the server"
                                }
                            }
                        }),
                        getActualSet: async ({ guild }) => {
                            let data = await WelcomeSchema.findOne({ Guild: guild.id })
                            if (data) return data.DMMessage
                            else return null
                        },
                        setNew: async ({ guild, newData }) => {
                            let data = await WelcomeSchema.findOne({Guild: guild.id}).catch(err => console.log(err))

                            if (!newData) newData = null

                            if (!data) {
                                data = new WelcomeSchema({
                                    Guild: guild.id,
                                    Channel: null,
                                    Messages: null,
                                    DM: false,
                                    DMMessage: newData,
                                    Content: false,
                                    Embed: false
                                })

                                await data.save()
            
                            } else {
                                data.DMMessage = newData
                                await data.save()
                            }

                            return
                        }
                    }
                ]
            }
        ],
        bot: client,
        acceptPrivacyPolicy: true,
        theme: SelectedTheme(
            {
                information: {
                    createdBy: "Nothing",
                    websiteTitle: "GeantBot",
                    websiteName: "GeantBot",
                    websiteUrl: "http://geantworld.tk",
                    dashboardUrl: `http://localhost:80/`,
                    supporteMail: "support@geantworld.tk",
                    supportServer: "https://discord.gg/8PC3dQt6Pq",
                    imageFavicon: "https://avatars.githubusercontent.com/u/116573899?s=200&v=4",
                    iconURL: "https://avatars.githubusercontent.com/u/116573899?s=200&v=4",
                    pageBackGround: "linear-gradient(#2CA8FF, #155b8d)",
                    loggedIn: "Successfully signed in.",
                    mainColor: "#2CA8FF",
                    subColor: "#ebdbdb",
                },
                index: {
                    card: {
                        category: "Welcome to the dashboard",
                        title: `welcome to the GeantBot dashboard.`,
                        image: "https://i.imgur.com/axnP93g.png",
                        footer: "GeantWorld Inc.",
                    },
                    information: {
                        category: "News",
                        title: "duckBot is now GeantBot",
                        description: `our discord is now called GeantBot`,
                        footer: "GeantWorld Inc.",
                    },
                    feeds: {
                        category: "Category",
                        title: "Information",
                        description: `This bot and panel is currently a work in progress so contact me if you find any issues on discord.`,
                        footer: "Footer",
                    },
                },
                commands: [
                    {
                        category: "Infos",
                        subTitle: "All helpful commands",
                        aliasesDisabled: true,
                        list: Information,
                    },
                    {
                        category: "Mods",
                        aliasesDisabled: true,
                        list: Moderation
                    },
                    {
                        category: "Owner",
                        subTitle: "Owner commands",
                        aliasesDisabled: true,
                        list: Owner
                    }
                ]
            }
        )
    })

    Dashboard.init()
    }
}

function CommandPush(filteredArray, CategoryArray) {
    filteredArray.forEach(obj => {
      let cmdObject = {
            commandName: obj.name,
            commandUsage: "/" + obj.name,
            commandDescription: obj.description,
            commandAlias: "None"
         }

    CategoryArray.push(cmdObject)
    })
}
