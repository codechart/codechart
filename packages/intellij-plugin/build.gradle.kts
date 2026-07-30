import org.jetbrains.intellij.platform.gradle.IntelliJPlatformType
import org.jetbrains.intellij.platform.gradle.models.ProductRelease

plugins {
    id("java")
    id("org.jetbrains.intellij.platform")
}

group = "ua.haltentech.plugin"
version = "1.0.0"

dependencies {
    intellijPlatform {
        // Build against the LOWEST supported IDE, not the newest one.
        intellijIdeaCommunity("2023.3.8")
    }
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

intellijPlatform {
    buildSearchableOptions = false

    pluginConfiguration {
        // Must not contain the word "Plugin": the Plugin Verifier rejects that as
        // TemplateWordInPluginName, which fails Marketplace validation.
        name = "Cochart"

        ideaVersion {
            sinceBuild = "233"
            // Deliberately unbounded: no until-build is written into plugin.xml, so the
            // plugin stays installable on every future IDE release.
            untilBuild = provider { null }
        }
    }

    pluginVerification {
        ides {
            recommended()
            create(IntelliJPlatformType.IntellijIdea, "2025.3")
            create(IntelliJPlatformType.IntellijIdea, "2026.1")
            create(IntelliJPlatformType.IntellijIdea, "2026.2")
            select {
                types = listOf(IntelliJPlatformType.IntellijIdea)
                channels = listOf(ProductRelease.Channel.EAP)
                sinceBuild = "262"
            }
        }
    }
}

tasks {
    runIde {
        jvmArgs("-XX:+UseG1GC", "-Xmx2048m")

        systemProperty("wsl.use.remote.agent.for.nio.filesystem", "true")
    }
}
