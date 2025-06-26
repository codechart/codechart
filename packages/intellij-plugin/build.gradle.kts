plugins {
    id("java")
    id("org.jetbrains.intellij") version "1.13.0"
}

group = "ua.haltentech.plugin"

repositories {
    mavenCentral()
}

// Configure Gradle IntelliJ Plugin
// Read more: https://plugins.jetbrains.com/docs/intellij/tools-gradle-intellij-plugin.html
intellij {
    pluginName.set("Covalent-IJ-Plugin")
    version.set("2024.3.3")
    type.set("IC")

}

tasks {
    // Set the JVM compatibility versions
    withType<JavaCompile> {
        sourceCompatibility = "17"
        targetCompatibility = "17"
    }

    patchPluginXml {
        sinceBuild.set("221.*")
        untilBuild.set("243.*")
    }

    signPlugin {
        certificateChain.set(System.getenv("CERTIFICATE_CHAIN"))
        privateKey.set(System.getenv("PRIVATE_KEY"))
        password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
    }

    publishPlugin {
        token.set(System.getenv("PUBLISH_TOKEN"))
    }
    runIde {
        jvmArgs("-XX:+UseG1GC")
        jvmArgs("-Xmx2048m")

        systemProperty("wsl.use.remote.agent.for.nio.filesystem", "true")
    }
}
