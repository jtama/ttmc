import io.quarkiverse.roq.frontmatter.runtime.model.DocumentPage;
import io.quarkiverse.roq.frontmatter.runtime.model.Page;
import io.quarkiverse.roq.frontmatter.runtime.model.RoqCollection;
import io.quarkus.qute.TemplateExtension;

import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.util.stream.Collectors;

public class TemplateExtensions {

    @TemplateExtension
    public static String collectionTitles(RoqCollection collection) {
        return "['%s']".formatted(collection.stream()
                .map(DocumentPage::title)
                        .map(value -> value.replaceAll("'", "\\\\'"))
                .collect(Collectors.joining("','")));
    }

    @TemplateExtension
    public static String allModules(RoqCollection collection) {
        return collection.stream()
                .map(document -> document.url().relative())
                .collect(Collectors.joining(","));
    }

    @TemplateExtension
    public static String nextModule(Page page) {
        RoqCollection modules = page.site().collections().get("modules");
        if (page.url().equals(page.site().url()))
            return modules.getFirst().url().relative();
        return modules.stream()
                .filter(item -> item.id().equals(page.id()))
                .findFirst()
                .map(DocumentPage::next)
                .map(doc -> doc.url().relative())
                .orElse(page.site().url().fromRoot("leaderboard").absolute());
    }
}
